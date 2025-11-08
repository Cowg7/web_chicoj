#!/bin/bash

# ============================================
# Script para Generar Diagramas PlantUML
# Sistema Chicoj
# ============================================

echo ""
echo "==============================================="
echo "  GENERADOR DE DIAGRAMAS PLANTUML - CHICOJ"
echo "==============================================="
echo ""

# ============ CONFIGURACIÓN ============

PLANTUML_URL="https://sourceforge.net/projects/plantuml/files/plantuml.jar/download"
PLANTUML_JAR="plantuml.jar"
DIAGRAMAS_DIR="diagramas"
OUTPUT_DIR="diagramas/output"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# ============ FUNCIONES ============

check_java() {
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1)
        echo -e "${GREEN}✅ Java encontrado: $JAVA_VERSION${NC}"
        return 0
    else
        echo -e "${RED}❌ Java no está instalado${NC}"
        echo ""
        echo -e "${YELLOW}Por favor instala Java:${NC}"
        echo -e "${WHITE}  • Ubuntu/Debian: sudo apt install openjdk-11-jre${NC}"
        echo -e "${WHITE}  • macOS: brew install openjdk@11${NC}"
        echo -e "${WHITE}  • Fedora: sudo dnf install java-11-openjdk${NC}"
        echo ""
        return 1
    fi
}

download_plantuml() {
    if [ -f "$PLANTUML_JAR" ]; then
        echo -e "${GREEN}✅ PlantUML JAR ya existe${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}📥 Descargando PlantUML JAR...${NC}"
    
    if command -v wget &> /dev/null; then
        wget -O "$PLANTUML_JAR" "$PLANTUML_URL" 2>&1 | grep -o '[0-9]\+%' | tail -1
    elif command -v curl &> /dev/null; then
        curl -L -o "$PLANTUML_JAR" "$PLANTUML_URL"
    else
        echo -e "${RED}❌ wget o curl no están instalados${NC}"
        return 1
    fi
    
    if [ -f "$PLANTUML_JAR" ]; then
        echo -e "${GREEN}✅ PlantUML descargado exitosamente${NC}"
        return 0
    else
        echo -e "${RED}❌ Error descargando PlantUML${NC}"
        return 1
    fi
}

create_output_directory() {
    if [ ! -d "$OUTPUT_DIR" ]; then
        mkdir -p "$OUTPUT_DIR"
        echo -e "${GREEN}✅ Directorio de salida creado: $OUTPUT_DIR${NC}"
    fi
}

generate_diagrams() {
    local format=$1
    local format_flag=""
    
    case $format in
        PNG)
            format_flag="-tpng"
            ;;
        SVG)
            format_flag="-tsvg"
            ;;
        PDF)
            format_flag="-tpdf"
            ;;
        *)
            format_flag="-tpng"
            ;;
    esac
    
    echo ""
    echo -e "${CYAN}📊 Generando diagramas en formato $format...${NC}"
    echo ""
    
    local files=("$DIAGRAMAS_DIR"/*.puml)
    local total=${#files[@]}
    local current=0
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            ((current++))
            local percent=$((current * 100 / total))
            local filename=$(basename "$file")
            
            echo -e "${WHITE}[$current/$total] ($percent%) Procesando: $filename${NC}"
            
            if java -jar "$PLANTUML_JAR" $format_flag -o "../$OUTPUT_DIR" "$file" > /dev/null 2>&1; then
                echo -e "  ${GREEN}✅ Generado exitosamente${NC}"
            else
                echo -e "  ${RED}❌ Error al generar${NC}"
            fi
        fi
    done
}

show_summary() {
    echo ""
    echo -e "${GREEN}===============================================${NC}"
    echo -e "${GREEN}  RESUMEN DE GENERACIÓN${NC}"
    echo -e "${GREEN}===============================================${NC}"
    echo ""
    
    local png_count=$(find "$OUTPUT_DIR" -name "*.png" 2>/dev/null | wc -l)
    local svg_count=$(find "$OUTPUT_DIR" -name "*.svg" 2>/dev/null | wc -l)
    local pdf_count=$(find "$OUTPUT_DIR" -name "*.pdf" 2>/dev/null | wc -l)
    
    echo -e "${CYAN}📁 Directorio de salida: $OUTPUT_DIR${NC}"
    echo ""
    echo -e "${WHITE}Archivos generados:${NC}"
    
    if [ $png_count -gt 0 ]; then
        echo -e "  ${GREEN}• PNG: $png_count archivos${NC}"
    else
        echo -e "  ${WHITE}• PNG: 0 archivos${NC}"
    fi
    
    if [ $svg_count -gt 0 ]; then
        echo -e "  ${GREEN}• SVG: $svg_count archivos${NC}"
    else
        echo -e "  ${WHITE}• SVG: 0 archivos${NC}"
    fi
    
    if [ $pdf_count -gt 0 ]; then
        echo -e "  ${GREEN}• PDF: $pdf_count archivos${NC}"
    else
        echo -e "  ${WHITE}• PDF: 0 archivos${NC}"
    fi
    
    echo ""
    
    local total=$((png_count + svg_count + pdf_count))
    if [ $total -gt 0 ]; then
        echo -e "${GREEN}✅ Diagramas generados exitosamente${NC}"
    else
        echo -e "${YELLOW}⚠️ No se generaron diagramas${NC}"
    fi
}

open_output_directory() {
    echo ""
    read -p "¿Deseas abrir el directorio de salida? (S/N): " response
    
    if [[ "$response" =~ ^[Ss]$ ]]; then
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open "$OUTPUT_DIR" 2>/dev/null || nautilus "$OUTPUT_DIR" 2>/dev/null
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            open "$OUTPUT_DIR"
        else
            echo -e "${YELLOW}No se pudo abrir automáticamente. Ruta: $OUTPUT_DIR${NC}"
        fi
    fi
}

# ============ MAIN ============

# Verificar Java
if ! check_java; then
    exit 1
fi

# Verificar directorio de diagramas
if [ ! -d "$DIAGRAMAS_DIR" ]; then
    echo -e "${RED}❌ Directorio '$DIAGRAMAS_DIR' no encontrado${NC}"
    exit 1
fi

# Descargar PlantUML si no existe
if ! download_plantuml; then
    echo -e "${RED}❌ No se pudo descargar PlantUML${NC}"
    echo -e "${YELLOW}Descarga manualmente desde: $PLANTUML_URL${NC}"
    exit 1
fi

# Crear directorio de salida
create_output_directory

# Menú de opciones
echo -e "${CYAN}Selecciona formato(s) de salida:${NC}"
echo -e "${WHITE}  1. PNG (recomendado para documentos)${NC}"
echo -e "${WHITE}  2. SVG (escalable, para web)${NC}"
echo -e "${WHITE}  3. PDF (para presentaciones)${NC}"
echo -e "${WHITE}  4. Todos los formatos${NC}"
echo ""

read -p "Opción (1-4): " choice

case $choice in
    1)
        generate_diagrams "PNG"
        ;;
    2)
        generate_diagrams "SVG"
        ;;
    3)
        generate_diagrams "PDF"
        ;;
    4)
        generate_diagrams "PNG"
        generate_diagrams "SVG"
        generate_diagrams "PDF"
        ;;
    *)
        echo -e "${YELLOW}⚠️ Opción inválida, generando PNG por defecto${NC}"
        generate_diagrams "PNG"
        ;;
esac

# Mostrar resumen
show_summary

# Abrir directorio
open_output_directory

echo ""
echo -e "${CYAN}===============================================${NC}"
echo -e "${GREEN}  ✅ PROCESO COMPLETADO${NC}"
echo -e "${CYAN}===============================================${NC}"
echo ""

