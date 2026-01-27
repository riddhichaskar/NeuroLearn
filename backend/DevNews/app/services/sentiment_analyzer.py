from transformers import pipeline
import torch
from typing import Dict, Any, List
from app.models.schemas import Sentiment, ImpactLevel
from app.config import config
import asyncio

class SentimentAnalyzer:
    def __init__(self):
        self.sentiment_model = None
        self.model_loaded = False
        self.impact_keywords = {
            'high': [
                'release', 'launch', 'major', 'critical', 'security', 'vulnerability',
                'breakthrough', 'revolutionary', 'acquisition', 'merger', 'funding',
                'investment', 'ipo', 'bankruptcy', 'layoff', 'hire', 'fire', 'ai',
                'artificial intelligence', 'machine learning', 'blockchain', 'cve',
                'data breach', 'hack', 'exploit'
            ],
            'medium': [
                'update', 'version', 'feature', 'improvement', 'partnership',
                'collaboration', 'integration', 'api', 'framework', 'library',
                'tutorial', 'guide', 'how to', 'best practice', 'performance',
                'optimization', 'refactor'
            ]
        }

    async def initialize_models(self):
        if self.model_loaded:
            return

        try:
            print(f"Loading sentiment model on {config.DEVICE}...")
            self.sentiment_model = pipeline(
                "sentiment-analysis",
                model=config.SENTIMENT_MODEL,
                tokenizer=config.SENTIMENT_MODEL,
                device=0 if config.USE_GPU else -1,
                torch_dtype=torch.float16 if config.USE_GPU else torch.float32,
                truncation=True,
                max_length=config.MODEL_MAX_LENGTH
            )
            self.model_loaded = True
            print("Sentiment model loaded successfully")
        except Exception as e:
            print(f"Error loading sentiment model: {e}")
            self.sentiment_model = None

    async def analyze_sentiment_batch(self, texts: List[str]) -> List[Sentiment]:
        if not texts or not config.ENABLE_SENTIMENT_ANALYSIS:
            return [Sentiment.NEUTRAL] * len(texts)

        try:
            await self.initialize_models()

            if self.sentiment_model is None:
                return [Sentiment.NEUTRAL] * len(texts)
            processed_texts = [text[:config.MODEL_MAX_LENGTH] for text in texts]
            results = self.sentiment_model(processed_texts, batch_size=config.BATCH_SIZE)

            sentiments = []
            for result in results:
                label = result['label'].lower()
                if 'positive' in label:
                    sentiments.append(Sentiment.POSITIVE)
                elif 'negative' in label:
                    sentiments.append(Sentiment.NEGATIVE)
                else:
                    sentiments.append(Sentiment.NEUTRAL)

            return sentiments

        except Exception as e:
            print(f"Batch sentiment analysis error: {e}")
            return [Sentiment.NEUTRAL] * len(texts)

    def analyze_impact_batch(self, articles_data: List[Dict]) -> List[ImpactLevel]:
        impacts = []

        for data in articles_data:
            title = data.get('title', '')
            summary = data.get('summary', '')
            tags = data.get('tags', [])

            text = f"{title} {summary} {' '.join(tags)}".lower()

            high_count = sum(1 for keyword in self.impact_keywords['high'] if keyword in text)
            medium_count = sum(1 for keyword in self.impact_keywords['medium'] if keyword in text)

            if high_count >= 2:
                impacts.append(ImpactLevel.HIGH)
            elif high_count >= 1 or medium_count >= 2:
                impacts.append(ImpactLevel.MEDIUM)
            else:
                impacts.append(ImpactLevel.LOW)

        return impacts

    async def analyze_articles_batch(self, articles_data: List[Dict]) -> List[Dict[str, Any]]:
        texts = [f"{data['title']}. {data.get('summary', '')}" for data in articles_data]
        sentiment_task = self.analyze_sentiment_batch(texts)
        impact_task = asyncio.get_event_loop().run_in_executor(
            None, self.analyze_impact_batch, articles_data
        )

        sentiments, impacts = await asyncio.gather(sentiment_task, impact_task)
        results = []
        for i in range(len(articles_data)):
            results.append({
                "sentiment": sentiments[i] if i < len(sentiments) else Sentiment.NEUTRAL,
                "impact": impacts[i] if i < len(impacts) else ImpactLevel.LOW
            })

        return results

    async def analyze_article(self, title: str, summary: str, tags: list) -> Dict[str, Any]:
        results = await self.analyze_articles_batch([{
            "title": title,
            "summary": summary,
            "tags": tags
        }])
        return results[0]


sentiment_analyzer = SentimentAnalyzer()