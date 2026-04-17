import typing
import yaml
from pathlib import Path

if typing.TYPE_CHECKING:
    from app.web.app import Application
    
def setup_config(app:"Application", config_path: str):
    with open(config_path, "r") as f:
        raw_config = yaml.safe_load(f)

    app.config = raw_config