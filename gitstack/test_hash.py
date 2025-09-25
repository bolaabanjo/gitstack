import os
from gitstack.main import calculate_file_hash
import tempfile

def test_calculate_file_hash():
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(b"hello world")
        path = tf.name
    h = calculate_file_hash(path)
    assert isinstance(h, str)
    assert len(h) == 64
    os.remove(path)