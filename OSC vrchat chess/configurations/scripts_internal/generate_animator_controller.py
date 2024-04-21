from shared_functions import read_json, generate_unique_id, generate_guid, copy_file, append_to_file, replace_placeholder
from shared_constants import TEMPLATE_DIRECTORY, OUTPUT_EXTERNAL_DIRECTORY, OUTPUT_INTERNAL_DIRECTORY

def map_json_config(input_path):
    data = read_json(input_path)
    unique_names = set()

    for item in data:
        unique_names.add(item["startName"])
        unique_names.add(item["endName"])

    unique_name_list = list(unique_names)
    unique_name_list.sort()

    animator_data = {
        'name': unique_name_list,
        'animator_state_machine_id': [generate_unique_id() for _ in unique_name_list],
        'animator_state_id': [generate_unique_id() for _ in unique_name_list],
        'animator_state_transition_id': [generate_unique_id() for _ in unique_name_list],
        'blend_tree_id': [generate_unique_id() for _ in unique_name_list],
        'min_threshold': [0 for _ in unique_name_list],
        'max_threshold': [255 for _ in unique_name_list],
    }
    
    return animator_data

def generate_animator_parameter(name):
    template = """
  - m_Name: {name}
    m_Type: 1
    m_DefaultFloat: 0
    m_DefaultInt: 0
    m_DefaultBool: 0
    m_Controller: {{fileID: 9100000}}"""
    return template.format(name=name)

def generate_animator_layer(name, animator_state_machine_id):
    template ="""
  - serializedVersion: 5
    m_Name: {name}
    m_StateMachine: {{fileID: {animator_state_machine_id}}}
    m_Mask: {{fileID: 0}}
    m_Motions: []
    m_Behaviours: []
    m_BlendingMode: 0
    m_SyncedLayerIndex: -1
    m_DefaultWeight: 1
    m_IKPass: 0
    m_SyncedLayerAffectsTiming: 0
    m_Controller: {{fileID: 9100000}}"""
    return template.format(name=name, animator_state_machine_id=animator_state_machine_id)

def generate_animator_controller(animator_paramaters, animator_layers):
    template = """
--- !u!91 &9100000
AnimatorController:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {{fileID: 0}}
  m_PrefabInstance: {{fileID: 0}}
  m_PrefabAsset: {{fileID: 0}}
  m_Name: FX
  serializedVersion: 5
  m_AnimatorParameters:{animator_paramaters}
  m_AnimatorLayers:{animator_layers}"""
    return template.format(animator_paramaters=animator_paramaters, animator_layers=animator_layers)

def generate_animator_state(animator_state_id, animator_state_transition_id, blend_tree_id):
    template = """
--- !u!1102 &{animator_state_id}
AnimatorState:
  serializedVersion: 6
  m_ObjectHideFlags: 1
  m_CorrespondingSourceObject: {{fileID: 0}}
  m_PrefabInstance: {{fileID: 0}}
  m_PrefabAsset: {{fileID: 0}}
  m_Name: Blend Tree
  m_Speed: 1
  m_CycleOffset: 0
  m_Transitions:
  - {{fileID: {animator_state_transition_id}}}
  m_StateMachineBehaviours: []
  m_Position: {{x: 50, y: 50, z: 0}}
  m_IKOnFeet: 0
  m_WriteDefaultValues: 1
  m_Mirror: 0
  m_SpeedParameterActive: 0
  m_MirrorParameterActive: 0
  m_CycleOffsetParameterActive: 0
  m_TimeParameterActive: 0
  m_Motion: {{fileID: {blend_tree_id}}}
  m_Tag: 
  m_SpeedParameter: 
  m_MirrorParameter: 
  m_CycleOffsetParameter: 
  m_TimeParameter: """
    return template.format(animator_state_id=animator_state_id, animator_state_transition_id=animator_state_transition_id, blend_tree_id=blend_tree_id)

def generate_animator_state_machine(name, animator_state_machine_id, animator_state_id):
    template = """
--- !u!1107 &{animator_state_machine_id}
AnimatorStateMachine:
  serializedVersion: 6
  m_ObjectHideFlags: 1
  m_CorrespondingSourceObject: {{fileID: 0}}
  m_PrefabInstance: {{fileID: 0}}
  m_PrefabAsset: {{fileID: 0}}
  m_Name: {name}
  m_ChildStates:
  - serializedVersion: 1
    m_State: {{fileID: {animator_state_id}}}
    m_Position: {{x: 300, y: 120, z: 0}}
  m_ChildStateMachines: []
  m_AnyStateTransitions: []
  m_EntryTransitions: []
  m_StateMachineTransitions: {{}}
  m_StateMachineBehaviours: []
  m_AnyStatePosition: {{x: 50, y: 20, z: 0}}
  m_EntryPosition: {{x: 50, y: 120, z: 0}}
  m_ExitPosition: {{x: 600, y: 120, z: 0}}
  m_ParentStateMachinePosition: {{x: 600, y: 20, z: 0}}
  m_DefaultState: {{fileID: {animator_state_id}}}"""
    return template.format(name=name, animator_state_machine_id=animator_state_machine_id, animator_state_id=animator_state_id)

def generate_blend_tree(name, blend_tree_id, min_threshold, max_threshold):
    template = """
--- !u!206 &{blend_tree_id}
BlendTree:
  m_ObjectHideFlags: 1
  m_CorrespondingSourceObject: {{fileID: 0}}
  m_PrefabInstance: {{fileID: 0}}
  m_PrefabAsset: {{fileID: 0}}
  m_Name: Blend Tree
  m_Childs:
  - serializedVersion: 2
    m_Motion: {{fileID: 0}}
    m_Threshold: {min_threshold}
    m_Position: {{x: 0, y: 0}}
    m_TimeScale: 1
    m_CycleOffset: 0
    m_DirectBlendParameter: {name}
    m_Mirror: 0
  - serializedVersion: 2
    m_Motion: {{fileID: 0}}
    m_Threshold: {max_threshold}
    m_Position: {{x: 0, y: 0}}
    m_TimeScale: 1
    m_CycleOffset: 0
    m_DirectBlendParameter: {name}
    m_Mirror: 0
  m_BlendParameter: {name}
  m_BlendParameterY: {name}
  m_MinThreshold: {min_threshold}
  m_MaxThreshold: {max_threshold}
  m_UseAutomaticThresholds: 0
  m_NormalizedBlendValues: 0
  m_BlendType: 0"""
    return template.format(name=name, blend_tree_id=blend_tree_id, min_threshold=min_threshold, max_threshold=max_threshold)

def generate_animator_state_transition(animator_state_transition_id):
    template = """
--- !u!1101 &{animator_state_transition_id}
AnimatorStateTransition:
  m_ObjectHideFlags: 1
  m_CorrespondingSourceObject: {{fileID: 0}}
  m_PrefabInstance: {{fileID: 0}}
  m_PrefabAsset: {{fileID: 0}}
  m_Name: 
  m_Conditions: []
  m_DstStateMachine: {{fileID: 0}}
  m_DstState: {{fileID: 0}}
  m_Solo: 0
  m_Mute: 0
  m_IsExit: 1
  serializedVersion: 3
  m_TransitionDuration: 0.25
  m_TransitionOffset: 0
  m_ExitTime: 0.75
  m_HasExitTime: 1
  m_HasFixedDuration: 1
  m_InterruptionSource: 0
  m_OrderedInterruption: 1
  m_CanTransitionToSelf: 1"""
    return template.format(animator_state_transition_id=animator_state_transition_id)


animatior_controller_output_path = OUTPUT_EXTERNAL_DIRECTORY + "FX.controller"
animatior_controller_meta_output_path = OUTPUT_EXTERNAL_DIRECTORY + "FX.controller.meta"

# TODO does not handle overflow bits correctly at the moment. Currently it simply treats it as a chunk
# generate meta file
copy_file(TEMPLATE_DIRECTORY + "animator_controller_base.controller.meta", animatior_controller_meta_output_path)
replace_placeholder(animatior_controller_meta_output_path, generate_guid())
# generate controller file
copy_file(TEMPLATE_DIRECTORY + "animator_controller_base.controller", animatior_controller_output_path)
json_data = map_json_config(OUTPUT_INTERNAL_DIRECTORY + "data_mapped.json")

# generate controller parameters and layers
animator_parameters = "".join(generate_animator_parameter(name) for name in json_data['name'])
animator_layers = "".join(generate_animator_layer(name, animator_state_machine_id) for name, animator_state_machine_id in zip(json_data['name'], json_data['animator_state_machine_id']))
append_to_file(animatior_controller_output_path, generate_animator_controller(animator_parameters, animator_layers))

# generate transition, blend tree
for i in range(len(json_data['name'])):
    name = json_data['name'][i]
    animator_state_machine_id = json_data['animator_state_machine_id'][i]
    animator_state_id = json_data['animator_state_id'][i]
    animator_state_transition_id = json_data['animator_state_transition_id'][i]
    blend_tree_id = json_data['blend_tree_id'][i]
    minT = json_data['min_threshold'][i]
    maxT = json_data['max_threshold'][i]
    
    append_to_file(animatior_controller_output_path, generate_animator_state_machine(name, animator_state_machine_id, animator_state_id))
    append_to_file(animatior_controller_output_path, generate_animator_state(animator_state_id, animator_state_transition_id, blend_tree_id))
    append_to_file(animatior_controller_output_path, generate_animator_state_transition(animator_state_transition_id))
    append_to_file(animatior_controller_output_path, generate_blend_tree(name, blend_tree_id, minT, maxT))

