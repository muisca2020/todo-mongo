const mongo_local = require('mongodb').MongoClient;
const debug = require('debug')('todo-mongo:task');

let partitionKey = undefined;

// Este es el modelo de datos
class Task {
    /**
     * Lee, añade y actualiza tareas en Mongo DB
     * @param {MongoClient} mongoClient 
     * @param {string} databaseId 
     * @param {string} containerId 
     */
    constructor(mongoClient, databaseId, containerId){
        this.client = mongoClient;
        this.databaseId = databaseId;
        this.containerId = containerId;

        this.database = null;
        this.container = null;
    }

    /** Esta función inicializa la base de datos */
    async init(){
        debug('Inicializando DB');
        const dbResponse = await this.client.databases.createIfNotExist({
            id: this.databaseId
        });
        
        this.database = dbResponse.database;
        debug('Inicializando contenedor');

        const contResponse = await this.database.containers.createIfNotExist({
            id: this.containerId
        });
        this.container = contResponse.container;
    }

    /**
     * Función para encontrar información (R)
     * @param {string} querySpec
     */
    async find(querySpec){
        debug('Buscando en l((a bases de datos');
        // Primero se valida si el container se creó
        if(!this.container) {
            throw new Error("Contenedor no inicializado");
        }

        const { resources } = await this.container.items.query(querySpec).fetchAll();
        return resources;
    }

    /**
     * Función para la creación de items (C)
     * @param {*} item 
     * @returns {resource} Item creado en la BD
     */
    async addItem(item) {
        debug('Añadiendo Item a la base de datos');
        item.date = Date.now();
        item.completed = false;

        const { recurso: doc } = await this.container.items.create(item);
        return doc;
    }

    /**
     * Función para actualizar un item (U)
     * @param {string} itemId 
     * @returns 
     */
    async updateItem(itemId) {
        debug('Actualizando Item');
        const doc = this.getItem(itemId);

        doc.completed = true;
        const { resource: replaced } = this.container.item(itemId, partitionKey).replace(doc);
        return replaced;
    }

    /**
     * Función para buscar un item
     * @param {string} itemId 
     * @returns 
     */
    async getItem(itemId) {
        debug('Buscando Item en la BD');
        const { resource } = await this.container.item(itemId, partitionKey);
        return resource
    }
}

module.exports = Task;