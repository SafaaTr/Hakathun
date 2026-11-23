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
    const pet = new this.petModel({
      ownerId: new Types.ObjectId(userId),
      referenceCode,
      name: dto.name || '',
      petType: dto.petType,
      age: dto.age,
      vaccinationRecordUrl: dto.vaccinationRecordUrl,
      lastVetVisitDate: new Date(dto.lastVetVisitDate),
      photoUrl: dto.photoUrl,
      notes: dto.notes || '',
    });

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
