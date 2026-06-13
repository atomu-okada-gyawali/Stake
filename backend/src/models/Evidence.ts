import { Schema, model, Document, Types } from 'mongoose';


export interface IVerification {
  verifierId: Types.ObjectId;
  approved: boolean;
  comment?: string;
  verifiedAt: Date;
}

export interface IEvidence {
  goalId: Types.ObjectId;
  subtaskId?: Types.ObjectId; // Optional - references specific project subtask
  userId: Types.ObjectId;
  proofData: string; // URL, file path, text, etc.
  status: 'pending' | 'verified' | 'failed';
  submittedAt: Date;
  verifications: IVerification[];
}

export interface IEvidenceDocument extends IEvidence, Document {}


const VerificationSchema = new Schema<IVerification>({
  verifierId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Verifier ID is required'],
  },
  approved: {
    type: Boolean,
    required: [true, 'Approval decision is required'],
  },
  comment: {
    type: String,
    trim: true,
  },
  verifiedAt: {
    type: Date,
    default: () => new Date(),
  },
}, { _id: false });

/**
 * Schema for Goal Verification Evidence / Logs.
 */
const EvidenceSchema = new Schema<IEvidenceDocument>({
  goalId: {
    type: Schema.Types.ObjectId,
    ref: 'Goal',
    required: [true, 'Goal ID is required'],
    index: true,
  },
  subtaskId: {
    type: Schema.Types.ObjectId, // Refers to the embedded subtask _id inside the Goal document
    required: false,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  proofData: {
    type: String,
    required: [true, 'Proof data description/URL is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending',
    index: true,
  },
  verifications: {
    type: [VerificationSchema],
    default: [],
  },
}, {
  // Uses custom name 'submittedAt' to override 'createdAt' as listed in the schema specification
  timestamps: { createdAt: 'submittedAt', updatedAt: false },
});

export const Evidence = model<IEvidenceDocument>('Evidence', EvidenceSchema);

// Alias exported as Log for convenience as the user labels it "Logs / Evidence Collection"
export const Log = Evidence;
export interface ILog extends IEvidence {}
export interface ILogDocument extends IEvidenceDocument {}
