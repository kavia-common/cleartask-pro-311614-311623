#!/bin/bash
cd /home/kavia/workspace/code-generation/cleartask-pro-311614-311623/todo_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

