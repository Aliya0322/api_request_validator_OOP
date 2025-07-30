class RequestValidator {
    #schema;
    
    constructor() {  
        this.#schema = {};  
    }

    loadSchema(schemaObject) {
        if (typeof schemaObject !== 'object' || schemaObject === null) {
            throw new Error(`${schemaObject} должен быть объектом`);
        }
        this.#schema = schemaObject;
    }

    validate(data) {
        if (!this.#schema) {
            throw new Error('Схема не загружена.');
        }

        this.lastResult = {
            valid: true,
            errors: {},  
        };

        for (const fieldName in this.#schema) {
            const fieldSchema = this.#schema[fieldName];
            const fieldValue = data[fieldName];

            if (!this.lastResult.errors[fieldName]) {
                this.lastResult.errors[fieldName] = [];
            }

            // Проверка обязательных полей
            if (fieldSchema.required && fieldValue === undefined) {
                if (!this.lastResult.errors[fieldName]) {
                    this.lastResult.errors[fieldName] = [];
                }
                this.lastResult.errors[fieldName].push('Поле обязательно для заполнения');
                this.lastResult.valid = false;
                continue;
            }

            // Проверка типа данных
            if (fieldSchema.type && typeof fieldValue !== fieldSchema.type) {
                this.lastResult.errors[fieldName].push(`Ожидается тип ${fieldSchema.type}, получен ${typeof fieldValue}`);
                this.lastResult.valid = false;
            }

            // Проверка минимальной длины
            if (fieldSchema.type === 'string' && typeof fieldValue === 'string') {
                if (fieldSchema.minLength !== undefined && fieldValue.length < fieldSchema.minLength) {
                    this.lastResult.errors[fieldName].push(`Минимальная длина - ${fieldSchema.minLength} символов`);
                    this.lastResult.valid = false;
                }
            }

        }
        
        return this.lastResult;
    }

    get isValid() {
        return this.lastResult?.valid ?? false;
    }

    getErrors() {
        return this.lastResult?.errors ?? {};
    }
}


const validator = new RequestValidator();
validator.loadSchema({ 
    name: { type: 'string', required: true, minLength: 3 },
    age: { type: 'number', required: false }
});

const validationResult = validator.validate({
    name: 'ab'
});

console.log(validationResult);
console.log("isValid:", validator.isValid);
console.log("Errors:", validator.getErrors());
