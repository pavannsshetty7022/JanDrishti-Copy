import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, index: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, required: true },
    phone_number: { type: String, required: true },
    address: { type: String, required: true },
    user_type: { type: String, required: true },
    user_type_custom: { type: String, default: null }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

userSchema.virtual("profile_completed").get(function () {
    return !!this.full_name;
});

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, index: true },
    password_hash: { type: String, required: true }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

const issueSchema = new mongoose.Schema({
    issue_id: { type: String, required: true, unique: true, index: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    date_of_occurrence: { type: String, required: true },
    media_paths: { type: [String], default: [] },
    status: { type: String, enum: ["OPEN", "PENDING", "RESOLVED", "REJECTED"], default: "OPEN" },
    feedback: { type: String, default: null },
    rating: { type: Number, default: null },
    resolved_at: { type: Date, default: null }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

export const User = mongoose.model("User", userSchema);
export const Admin = mongoose.model("Admin", adminSchema);
export const Issue = mongoose.model("Issue", issueSchema);
