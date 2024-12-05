//import all models
const User = require("./User");
const PhysicalMeasurement = require("./PhysicalMeasurement");
const TrainingPreference = require("./TrainingPreference");
const Equipment = require("./Equipment");
const AccessCategory = require("./AccessCategory");
const EquipmentAccess = require("./EquipmentAccess");
const UserEquipment = require("./UserEquipment");

User.hasOne(TrainingPreference, { foreignKey: "user_id" });
TrainingPreference.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(PhysicalMeasurement, { foreignKey: "user_id" });
PhysicalMeasurement.belongsTo(User, { foreignKey: "user_id" });

Equipment.belongsToMany(AccessCategory, {
    through: EquipmentAccess,
    foreignKey: "equipment_name",
    otherKey: "access_category_name",
});

AccessCategory.belongsToMany(Equipment, {
    through: EquipmentAccess,
    foreignKey: "access_category_name",
    otherKey: "equipment_name",
});

User.belongsToMany(Equipment, {
    through: UserEquipment,
    foreignKey: "user_id",
    otherKey: "equipment_name",
});

Equipment.belongsToMany(User, {
    through: UserEquipment,
    foreignKey: "equipment_name",
    otherKey: "user_id",
});

module.exports = {
    User,
    PhysicalMeasurement,
    TrainingPreference,
    Equipment,
    AccessCategory,
    EquipmentAccess,
    UserEquipment
};
