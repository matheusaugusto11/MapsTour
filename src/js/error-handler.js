// error-handler.js
// Exibe TODOS os erros na tela do celular

let errors = [];
const MAX_ERRORS = 20;

// Criar painel de erros
function createErrorPanel() {
    const panel = document.createElement('div');
    panel.id = 'error-panel';
    
    panel.style.position = 'fixed';
    panel.style.bottom = '20px';
    panel.style.left = '10px';
    panel.style.right = '10px';
    panel.style.maxHeight = '50vh';
    panel.style.backgroundColor = '#1a1a1a';
    panel.style.color = '#ff6b6b';
    panel.style.fontSize = '16px';
    panel.style.fontFamily = '"Courier New", monospace';
    panel.style.zIndex = '10000';
    panel.style.overflowY = 'auto';
    panel.style.padding = '15px';
    panel.style.borderRadius = '8px';
    panel.style.border = '3px solid #ff6b6b';
    panel.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.8)';
    panel.style.lineHeight = '1.6';
    
    // Título
    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.style.fontSize = '18px';
    title.style.marginBottom = '10px';
    title.style.color = '#ffa500';
    title.textContent = '⚠️ ERROS CAPTURADOS';
    panel.appendChild(title);
    
    // Botão limpar
    const clearButton = document.createElement('button');
    clearButton.textContent = '🗑️ Limpar Erros';
    clearButton.style.width = '100%';
    clearButton.style.marginBottom = '10px';
    clearButton.style.padding = '10px';
    clearButton.style.fontSize = '14px';
    clearButton.style.backgroundColor = '#ff6b6b';
    clearButton.style.color = 'white';
    clearButton.style.border = 'none';
    clearButton.style.borderRadius = '4px';
    clearButton.style.cursor = 'pointer';
    clearButton.style.fontWeight = 'bold';
    clearButton.onclick = () => {
        errors = [];
        updateErrorPanel();
    };
    panel.appendChild(clearButton);
    
    // Container de erros
    const errorList = document.createElement('div');
    errorList.id = 'error-list';
    panel.appendChild(errorList);
    
    document.body.appendChild(panel);
    console.log('✅ Painel de erros criado');
}

// Atualizar painel
function updateErrorPanel() {
    const errorList = document.getElementById('error-list');
    if (!errorList) return;
    
    errorList.innerHTML = '';
    
    if (errors.length === 0) {
        errorList.innerHTML = '<div style="color: #90ee90;">✅ Nenhum erro capturado</div>';
        return;
    }
    
    errors.forEach((err, idx) => {
        const errorItem = document.createElement('div');
        errorItem.style.marginBottom = '15px';
        errorItem.style.borderBottom = '1px solid #ff6b6b';
        errorItem.style.paddingBottom = '10px';
        
        errorItem.innerHTML = `
            <div style="color: #ffa500; font-weight: bold;">[${idx + 1}] ${err.type}</div>
            <div style="color: #ff6b6b; font-weight: bold;">📝 ${err.message}</div>
            <div style="color: #888; font-size: 12px;">⏰ ${err.timestamp}</div>
            <div style="color: #888; font-size: 12px;">📍 Linha: ${err.line}</div>
        `;
        
        errorList.appendChild(errorItem);
    });
    
    // Auto-scroll para baixo
    errorList.parentElement.scrollTop = errorList.parentElement.scrollHeight;
}

// Adicionar erro
function addError(type, message, line = 'N/A') {
    const timestamp = new Date().toLocaleTimeString();
    errors.push({ type, message, line, timestamp });
    
    if (errors.length > MAX_ERRORS) {
        errors.shift();
    }
    
    updateErrorPanel();
    console.error(`[${type}] ${message}`);
}

// Capturar erros não tratados
window.addEventListener('error', function(event) {
    addError(
        'Uncaught Error',
        event.message || 'Erro desconhecido',
        event.lineno
    );
});

// Capturar rejeições de promises
window.addEventListener('unhandledrejection', function(event) {
    addError(
        'Unhandled Promise',
        event.reason ? event.reason.toString() : 'Promise rejeitada',
        'N/A'
    );
});

// Sobrescrever console.error
const originalError = console.error;
console.error = function(...args) {
    addError('Console Error', args.join(' '), 'N/A');
    originalError.apply(console, args);
};

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createErrorPanel);
} else {
    createErrorPanel();
}