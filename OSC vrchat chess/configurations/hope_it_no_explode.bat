@echo off
python scripts_internal/generate_data_mapped.py
echo User defined data mapped.
python scripts_internal/generate_vrc_expression_paramters.py
echo VRC expression paramters generated.
python scripts_internal/generate_animations.py
echo Animations generated.
python scripts_internal/generate_animator_controller.py
echo Animator controller generated.
python scripts_internal/generate_shaders_and_materials.py
echo Shaders and materials generated.
echo All scripts have finished running. Files can be found under 'auto_generated_files_external'
pause