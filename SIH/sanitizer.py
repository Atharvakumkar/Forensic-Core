from pathlib import Path


def sanitize_file(file_path, progress_callback=None):
    path = Path(file_path)

    file_size = path.stat().st_size
    chunk_size = 1024 * 1024
    processed = 0

    with open(path, "r+b") as file:
        remaining = file_size

        while remaining > 0:
            size = min(chunk_size, remaining)

            file.write(b"\x00" * size)

            processed += size
            remaining -= size

            if progress_callback:
                progress = int((processed / file_size) * 100)
                progress_callback(progress)

        file.flush()

    return True