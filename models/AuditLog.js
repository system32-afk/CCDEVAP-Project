const mongoose = require('mongoose');
const auditLogSchema = new mongoose.Schema({
actor: { type: String, required: true },
action: { type: String, required: true },
user_role: { type: String, required: true },
timestamp: { type: Date, default: Date.now }
},{ collection: 'AuditLog' });

module.exports = mongoose.model('AuditLog', auditLogSchema);