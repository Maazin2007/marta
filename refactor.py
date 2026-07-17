import os
import glob

base = "src/main/java/com/marta/auth/"
dirs = ["controller", "service", "repository"]

for d in dirs:
    for f in glob.glob(os.path.join(base, d, "*.java")):
        with open(f, 'r') as file:
            content = file.read()
        
        # update package
        content = content.replace("package com.marta.auth;", f"package com.marta.auth.{d};\n\nimport com.marta.auth.service.*;\nimport com.marta.auth.repository.*;")
        
        with open(f, 'w') as file:
            file.write(content)

# Update JwtAuthenticationFilter in config
config_file = "src/main/java/com/marta/config/JwtAuthenticationFilter.java"
if os.path.exists(config_file):
    with open(config_file, 'r') as file:
        content = file.read()
    content = content.replace("import com.marta.auth.JwtService;", "import com.marta.auth.service.JwtService;")
    with open(config_file, 'w') as file:
        file.write(content)
