import re

text = "Hello, world! This is a simple sentence."

tokens = re.findall(r'\b\w+\b', text)

print(tokens)
