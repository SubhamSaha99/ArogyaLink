import os
import sys

# Ensure proto/generated is in sys.path so patient_pb2 can be imported
_proto_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "proto", "generated")
if _proto_dir not in sys.path:
    sys.path.append(_proto_dir)
