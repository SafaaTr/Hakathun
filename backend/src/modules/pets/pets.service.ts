import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pet, PetDocument } from '../../database/schemas/pet.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { CreatePetDto } from './dto/create-pet.dto';
import * as crypto from 'crypto';

@Injectable()
export class PetsService {
  constructor(
    @InjectModel(Pet.name) private petModel: Model<PetDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private generateReference(): string {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `PET-${randomHex}`;
  }

  async createPet(userId: string, dto: CreatePetDto): Promise<PetDocument> {
    const referenceCode = this.generateReference();
    const defaultPhoto = 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400';
    const pet = new this.petModel({
      ownerId: new Types.ObjectId(userId),
      referenceCode,
      name: dto.name || '',
      petType: dto.petType,
      age: dto.age,
      vaccinationRecordUrl: dto.vaccinationRecordUrl || 'Record on file',
      lastVetVisitDate: dto.lastVetVisitDate ? new Date(dto.lastVetVisitDate) : new Date(),
      photoUrl: dto.photoUrl || defaultPhoto,
      notes: dto.notes || '',
    });

    await pet.save();

    return pet;
  }

  async updatePet(id: string, userId: string, dto: Partial<CreatePetDto>): Promise<PetDocument> {
    const pet = await this.petModel.findOne({
      _id: new Types.ObjectId(id),
      ownerId: new Types.ObjectId(userId),
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (dto.name !== undefined) pet.name = dto.name;
    if (dto.petType !== undefined) pet.petType = dto.petType;
    if (dto.age !== undefined) pet.age = dto.age;
    if (dto.vaccinationRecordUrl !== undefined) pet.vaccinationRecordUrl = dto.vaccinationRecordUrl;
    if (dto.lastVetVisitDate !== undefined) pet.lastVetVisitDate = new Date(dto.lastVetVisitDate);
    if (dto.photoUrl !== undefined) pet.photoUrl = dto.photoUrl;
    if (dto.notes !== undefined) pet.notes = dto.notes;

    await pet.save();
    return pet;
  }

  async getMyPets(userId: string): Promise<PetDocument[]> {
    return this.petModel.find({ ownerId: new Types.ObjectId(userId) }).exec();
  }

  async getPetById(id: string, userId?: string): Promise<PetDocument> {
    const pet = await this.petModel.findById(id).exec();
    if (!pet) {
      throw new NotFoundException('Pet not found');
    }
    return pet;
  }
}
