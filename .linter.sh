#!/bin/bash
cd /home/kavia/workspace/code-generation/classroomconnect-16385-1d2c28e9/classroomconnect
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

