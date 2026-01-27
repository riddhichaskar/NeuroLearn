from transformers import pipeline
import asyncio
import torch
from app.config import config
from app.services.content_processor import content_processor


class NewsSummarizer:
    def __init__(self):
        self.summarizer = None
        self.model_loaded = False

    async def initialize_model(self):
        if self.model_loaded:
            return

        try:
            print(f"Loading summarization model on {config.DEVICE}...")
            self.summarizer = pipeline(
                "summarization",
                model=config.SUMMARIZATION_MODEL,
                tokenizer=config.SUMMARIZATION_MODEL,
                device=0 if config.USE_GPU else -1,
                torch_dtype=torch.float16 if config.USE_GPU else torch.float32,
                truncation=True
            )
            self.model_loaded = True
            print("Summarization model loaded successfully")
        except Exception as e:
            print(f"Error loading summarization model: {e}")
            self.summarizer = None

    async def summarize_batch(self, texts: list) -> list:
        if not texts or not config.ENABLE_SUMMARIZATION:
            return [content_processor.extract_content_preview(text, 120) for text in texts]

        try:
            await self.initialize_model()

            if self.summarizer is None:
                return [content_processor.extract_content_preview(text, 120) for text in texts]

            processed_texts = []
            original_indices = []

            for i, text in enumerate(texts):
                cleaned = content_processor.clean_text(text)[:600]  # Limit length
                word_count = len(cleaned.split())

                if 15 <= word_count <= 300:
                    processed_texts.append(cleaned)
                    original_indices.append(i)

            if not processed_texts:
                return [content_processor.extract_content_preview(text, 120) for text in texts]

            summaries = [content_processor.extract_content_preview(text, 120) for text in texts]

            for i in range(0, len(processed_texts), config.BATCH_SIZE):
                batch = processed_texts[i:i + config.BATCH_SIZE]

                try:
                    batch_summaries = await asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: self.summarizer(
                            batch,
                            max_length=config.SUMMARIZATION_MAX_LENGTH,
                            min_length=config.SUMMARIZATION_MIN_LENGTH,
                            do_sample=False,
                            truncation=True,
                            batch_size=len(batch)
                        )
                    )

                    for j, result in enumerate(batch_summaries):
                        idx = original_indices[i + j]
                        summaries[idx] = content_processor.clean_text(result['summary_text'])

                except Exception as e:
                    print(f"Batch summarization error: {e}")
                    continue

            return summaries

        except Exception as e:
            print(f"Summarization error: {e}")
            return [content_processor.extract_content_preview(text, 120) for text in texts]

    async def summarize(self, text: str) -> str:
        results = await self.summarize_batch([text])
        return results[0]


summarizer = NewsSummarizer()