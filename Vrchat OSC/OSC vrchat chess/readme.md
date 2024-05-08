
Guide:


Step 1:
Fill out these two json files:
  -configurations\user_defined_data\data.json
  -configurations\user_defined_data\input.json
    Inputs must contain a ! at the start in unity but without it in input.json

Step 2:
Implement the typescript code OSCVrChat should not need any changes. Simply create an instance with your own class that implements OSCVrChatGameLogic
  -src/index.ts

Step 3:
Run python code to generate unity files and copy files via directory. DO NOT copy them directly into unity as it will overwrite some of the meta files and break linking.
  -configurations\auto_generated_files_external

Step 4:
Run and build index.js via npm run test