const { getDB,getNextSequence } = require('./db.js');
 
async function insertImage({ image, caption, }) {
    const db = getDB();
    const newImageData = {
        image,
        caption,
    };
    newImageData.id = await getNextSequence();
    newImageData.created = new Date();
    const result = await db.collection('imageMetaData').insertOne(newImageData);
    const savedImage = await db.collection('imageMetaData')
        .findOne({ _id: result.insertedId });
    return savedImage;
}

const PAGE_SIZE = 5;
async function getImages(filter,page) {
    const db = getDB();
    const images = await db.collection('imageMetaData').find(filter).sort({ id: 1 }).skip(PAGE_SIZE * (page - 1)).limit(PAGE_SIZE).toArray();
    const totalCount = await db
      .collection("imageMetaData")
      .countDocuments(filter);
    const pages = Math.ceil(totalCount / PAGE_SIZE);
    return {images,pages};
}

async function update({ id, changes }) {
    const db = getDB();
    const result = await db.collection('imageMetaData').updateOne({ id }, { $set: changes });
    return result;
}

async function deleteImage(id) {
    const db = getDB();
    const imageData = await db.collection('imageMetaData').findOne({ id });
    if (!imageData) return false;
    imageData.deleted = new Date();
    
    let result = await db.collection('deleted_images').insertOne(imageData);
    if (result.insertedId) {
        result = await db.collection('imageMetaData').deleteOne({ id });
        return result.deletedCount === 1;
    }
    return false;
}

module.exports = { insertImage,getImages,update,deleteImage };