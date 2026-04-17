import boto3
import json

# Подключаемся к нашему MinIO
s3 = boto3.client('s3',
    endpoint_url='http://127.0.0.1:9000', # Обрати внимание: 9000 порт!
    aws_access_key_id='admin',
    aws_secret_access_key='superpassword'
)

# Пишем политику: "Разрешить всем (Principal: *) скачивать (GetObject) любые файлы из бакета"
policy = {
    "Version": "2012-10-17",
    "Statement":[
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": ["s3:GetObject"],
            "Resource":["arn:aws:s3:::fishguide-images/*"]
        }
    ]
}

# Отправляем в MinIO
s3.put_bucket_policy(Bucket='fishguide-images', Policy=json.dumps(policy))
print("Бакет успешно стал публичным!")