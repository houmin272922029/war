import sys
import tinify

tinify.key = sys.argv[1]

if len(sys.argv) == 4:
    source = tinify.from_file(sys.argv[2])
    source.to_file(sys.argv[3])
