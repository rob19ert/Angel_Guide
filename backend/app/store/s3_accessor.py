import uuid
import aioboto3
from app.store.base_accessor import BaseAccessor

class S3Accessor(BaseAccessor):
    def __init__(self, app):
        super().__init__(app)
        self.session = aioboto3.Session()

    async def upload_image(self, file_bytes: bytes, original_filename: str) -> str:
        # 1. Достаем конфиги
        cfg = self.app.config["s3"]
        
        # 2. Генерируем уникальное имя файла, чтобы не перезаписать чужие фотки
        extension = original_filename.split(".")[-1] if "." in original_filename else "png"
        new_filename = f"{uuid.uuid4().hex}.{extension}"
        
        # 3. Подключаемся и загружаем
        async with self.session.client(
            "s3",
            endpoint_url=cfg["endpoint_url"],
            aws_access_key_id=cfg["access_key"],
            aws_secret_access_key=cfg["secret_key"]
        ) as client:
            await client.put_object(
                Bucket=cfg["bucket_name"],
                Key=new_filename,
                Body=file_bytes
            )
            
        # 4. Возвращаем готовую публичную ссылку на картинку
        return f'{cfg["endpoint_url"]}/{cfg["bucket_name"]}/{new_filename}'