db.imageMetaData.deleteMany({});
db.deleted_images.deleteMany({});

const count = db.imageMetaData.countDocuments();
print(`Inserted ${count} issues`);
db.counters.deleteMany({});
db.counters.insertOne({
    _id: "imageMetaData",
    current: count,
});

db.imageMetaData.createIndex({ caption: "text" });

