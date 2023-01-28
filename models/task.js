const MongoClient = require('mongodb').MongoClient;
const debug = require('debug')('todo-mongo:task');

class Task {
    /**
     * Lee, añade y actualiza tareas en Mongo DB
     * @param {MongoClient} mongoClient 
     * @param {string} databaseId 
     * @param {string} collectionName 
     */
    constructor(mongoClient, databaseId, collectionName){
        this.client = mongoClient;
        this.databaseId = databaseId;
        this.collectionName = collectionName;

        this.db = null;
        this.collection = null;
    }

    /** Esta función inicializa la base de datos */
    async init(){
        debug('Inicializando DB');
        this.db = await this.client.db(this.databaseId);
        
        debug('Inicializando colección');
        this.collection = await this.db.createCollection(this.collectionName);
    }

    /**
     * Función para encontrar información (R)
     * @param {object} query 
     */
    async find(query){
        debug('Buscando en la base de datos');
        // Primero se valida si la colección se creó
        if(!this.collection) {
            throw new Error("Colección no inicializada");
        }

        const docs = await this.collection.find(query).toArray();
        return docs;
    }

    /**
     * Función para la creación de items (C)
     * @param {*} item 
     * @returns {object} Item creado en la BD
     */
    async addItem(item) {
        debug('Añadiendo Item a la base de datos');
        item.date = Date.now();
        item.completed = false;

        const result = await this.collection.insertOne(item);
        return result.ops[0];
    }

    /**
     * Función para actualizar un item (U)
     * @param {string} itemId 
     * @param {object} update 
     * @returns {object} Item actualizado en la BD
     */
    async updateItem(itemId, update) {
        debug('Actualizando Item');

        const result = await this.collection.findOneAndUpdate({ _id: itemId }, { $set: update }, { returnOriginal: false });
        return result.value;
    }

    /**
     * Función para buscar un item
     * @param {string} itemId 
     * @returns {object} Item encontrado en la BD
     */
    async getItem(itemId) {
        debug('Buscando Item en la BD');
        const item = await this.collection.findOne({ _id: itemId });
        return item;
    }

    /**
     * Función para borrar un item (D)
     * @param {string} itemId 
     * @returns 
     */
    async deleteItem(itemId) {
        debug('Borrando Item');
        await this.container.item(itemId, partitionKey).delete();
    }
}
    
module.exports = Task;