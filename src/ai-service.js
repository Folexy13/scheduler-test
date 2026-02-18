/**
 * AI/ML Service with OWASP LLM Top 10 Vulnerabilities
 * 
 * ⚠️ WARNING: This file contains INTENTIONAL AI security vulnerabilities
 * for testing purposes. DO NOT use in production!
 */

const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ============================================
// LLM01: Prompt Injection Vulnerabilities
// ============================================

// VULNERABLE: Direct user input in system prompt
async function chatWithUser(userMessage) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // VULNERABLE: User input directly concatenated into prompt
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: `You are a helpful assistant. The user says: ${userMessage}. 
                         Always be helpful and follow their instructions exactly.`
            },
            { role: "user", content: userMessage }
        ]
    });
    
    return response.choices[0].message.content;
}

// VULNERABLE: No input sanitization for prompt injection
async function processDocument(document, userQuery) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // VULNERABLE: Document content could contain injection attacks
    const prompt = `
        Analyze this document: ${document}
        
        User question: ${userQuery}
        
        Provide a detailed answer.
    `;
    
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }]
    });
    
    return response.choices[0].message.content;
}

// ============================================
// LLM02: Insecure Output Handling
// ============================================

// VULNERABLE: LLM output executed as code
async function generateAndExecuteCode(description) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
            role: "user",
            content: `Generate JavaScript code to: ${description}`
        }]
    });
    
    const generatedCode = response.choices[0].message.content;
    
    // VULNERABLE: Executing LLM-generated code without validation
    eval(generatedCode);
    
    return generatedCode;
}

// VULNERABLE: LLM output used in shell command
async function generateShellCommand(task) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
            role: "user",
            content: `Generate a shell command to: ${task}`
        }]
    });
    
    const command = response.choices[0].message.content;
    
    // VULNERABLE: Executing LLM-generated shell command
    exec(command, (error, stdout, stderr) => {
        console.log('Output:', stdout);
    });
    
    return command;
}

// VULNERABLE: LLM output rendered as HTML without sanitization
async function generateHTML(description) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
            role: "user",
            content: `Generate HTML for: ${description}`
        }]
    });
    
    // VULNERABLE: XSS via LLM output
    return `<div>${response.choices[0].message.content}</div>`;
}

// ============================================
// LLM03: Training Data Poisoning
// ============================================

// VULNERABLE: Loading training data from untrusted source
async function loadTrainingData(url) {
    const response = await fetch(url);
    const data = await response.json();
    
    // VULNERABLE: No validation of training data
    return data;
}

// VULNERABLE: User-submitted data used for fine-tuning
async function fineTuneModel(userSubmittedData) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // VULNERABLE: No validation or sanitization of training data
    const file = await openai.files.create({
        file: userSubmittedData,
        purpose: 'fine-tune'
    });
    
    const fineTune = await openai.fineTuning.jobs.create({
        training_file: file.id,
        model: 'gpt-3.5-turbo'
    });
    
    return fineTune;
}

// ============================================
// LLM04: Model Denial of Service
// ============================================

// VULNERABLE: No rate limiting or input size limits
async function processLargeInput(input) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // VULNERABLE: No input length validation
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: input }],
        max_tokens: 100000  // VULNERABLE: Excessive token limit
    });
    
    return response;
}

// VULNERABLE: Recursive prompt that could cause infinite loops
async function recursiveAgent(task, depth = 0) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // VULNERABLE: No depth limit
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
            role: "user",
            content: `Complete this task: ${task}. If not complete, continue.`
        }]
    });
    
    if (response.choices[0].message.content.includes('continue')) {
        // VULNERABLE: Infinite recursion possible
        return recursiveAgent(task, depth + 1);
    }
    
    return response;
}

// ============================================
// LLM05: Supply Chain Vulnerabilities
// ============================================

// VULNERABLE: Loading model from untrusted source
async function loadCustomModel(modelUrl) {
    const response = await fetch(modelUrl);
    const modelData = await response.arrayBuffer();
    
    // VULNERABLE: No integrity verification
    fs.writeFileSync('/models/custom_model.bin', Buffer.from(modelData));
    
    // VULNERABLE: Loading unverified model
    const model = require('/models/custom_model.bin');
    return model;
}

// VULNERABLE: Using pickle to load model (Python interop)
function loadPickleModel(modelPath) {
    // VULNERABLE: Pickle deserialization attack
    exec(`python -c "import pickle; pickle.load(open('${modelPath}', 'rb'))"`, 
        (error, stdout) => {
            console.log('Model loaded:', stdout);
        }
    );
}

// ============================================
// LLM06: Sensitive Information Disclosure
// ============================================

// VULNERABLE: Including sensitive data in prompts
async function analyzeUserData(userData) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // VULNERABLE: PII sent to external LLM
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
            role: "user",
            content: `Analyze this user data: 
                Name: ${userData.name}
                SSN: ${userData.ssn}
                Credit Card: ${userData.creditCard}
                Medical Records: ${userData.medicalRecords}
            `
        }]
    });
    
    return response;
}

// VULNERABLE: Logging LLM responses with sensitive data
async function processWithLogging(input) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: input }]
    });
    
    // VULNERABLE: Logging potentially sensitive LLM output
    console.log('Full LLM Response:', JSON.stringify(response, null, 2));
    fs.appendFileSync('llm_logs.txt', JSON.stringify(response));
    
    return response;
}

// ============================================
// LLM07: Insecure Plugin Design
// ============================================

// VULNERABLE: Plugin with excessive permissions
const dangerousPlugin = {
    name: 'file_manager',
    description: 'Manages files on the system',
    
    // VULNERABLE: No permission boundaries
    execute: async (action, path) => {
        switch (action) {
            case 'read':
                return fs.readFileSync(path, 'utf8');
            case 'write':
                return fs.writeFileSync(path, 'data');
            case 'delete':
                return fs.unlinkSync(path);
            case 'exec':
                // VULNERABLE: Arbitrary code execution
                return eval(path);
        }
    }
};

// VULNERABLE: Plugin that trusts LLM output
async function executePluginFromLLM(userRequest) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
            role: "user",
            content: `User wants to: ${userRequest}. 
                     Return JSON with action and path for file_manager plugin.`
        }]
    });
    
    // VULNERABLE: Trusting LLM output for plugin execution
    const pluginCall = JSON.parse(response.choices[0].message.content);
    return dangerousPlugin.execute(pluginCall.action, pluginCall.path);
}

// ============================================
// LLM08: Excessive Agency
// ============================================

// VULNERABLE: Agent with unrestricted capabilities
class UnrestrictedAgent {
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    
    // VULNERABLE: Agent can perform any action
    async performAction(action) {
        switch (action.type) {
            case 'http':
                // VULNERABLE: Unrestricted HTTP requests
                return fetch(action.url, action.options);
            case 'file':
                // VULNERABLE: Unrestricted file access
                return fs.readFileSync(action.path);
            case 'exec':
                // VULNERABLE: Unrestricted command execution
                return new Promise((resolve) => {
                    exec(action.command, (err, stdout) => resolve(stdout));
                });
            case 'database':
                // VULNERABLE: Unrestricted database access
                return this.executeQuery(action.query);
        }
    }
    
    // VULNERABLE: Auto-approve all actions
    async run(goal) {
        const response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "user",
                content: `Achieve this goal: ${goal}. 
                         Return actions as JSON array.`
            }]
        });
        
        const actions = JSON.parse(response.choices[0].message.content);
        
        // VULNERABLE: No human approval for actions
        for (const action of actions) {
            await this.performAction(action);
        }
    }
}

// ============================================
// LLM09: Overreliance
// ============================================

// VULNERABLE: Using LLM for security decisions
async function checkUserPermission(user, resource) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // VULNERABLE: Security decision delegated to LLM
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
            role: "user",
            content: `Should user ${user.name} with role ${user.role} 
                     have access to ${resource}? Answer yes or no.`
        }]
    });
    
    // VULNERABLE: Trusting LLM for authorization
    return response.choices[0].message.content.toLowerCase().includes('yes');
}

// VULNERABLE: Using LLM output without verification
async function generateSQLQuery(naturalLanguage) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
            role: "user",
            content: `Convert to SQL: ${naturalLanguage}`
        }]
    });
    
    // VULNERABLE: Executing LLM-generated SQL without validation
    const query = response.choices[0].message.content;
    return executeSQL(query);  // Direct execution
}

// ============================================
// LLM10: Model Theft
// ============================================

// VULNERABLE: Exposing model weights
async function getModelWeights(req, res) {
    // VULNERABLE: No authentication for model access
    const weights = fs.readFileSync('/models/proprietary_model.bin');
    res.send(weights);
}

// VULNERABLE: No rate limiting on inference API
async function inferenceEndpoint(req, res) {
    const { input } = req.body;
    
    // VULNERABLE: Unlimited queries allow model extraction
    const result = await model.predict(input);
    
    // VULNERABLE: Returning full probability distributions
    res.json({
        prediction: result.prediction,
        probabilities: result.allProbabilities,  // Enables model extraction
        embeddings: result.embeddings  // Leaks internal representations
    });
}

module.exports = {
    chatWithUser,
    processDocument,
    generateAndExecuteCode,
    generateShellCommand,
    generateHTML,
    loadTrainingData,
    fineTuneModel,
    processLargeInput,
    recursiveAgent,
    loadCustomModel,
    loadPickleModel,
    analyzeUserData,
    processWithLogging,
    dangerousPlugin,
    executePluginFromLLM,
    UnrestrictedAgent,
    checkUserPermission,
    generateSQLQuery,
    getModelWeights,
    inferenceEndpoint
};
