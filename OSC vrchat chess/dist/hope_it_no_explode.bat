@echo off
python generateDataMapped.py
python generateVrcExpressionParamters.py
python generateAnimations.py
python generateAnimationController.py
echo All scripts have finished running.
pause