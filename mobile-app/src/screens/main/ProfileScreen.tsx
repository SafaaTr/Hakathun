import { CreatePetPayload, savePetRequest } from "@/services/petService";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  View,
} from "react-native";
import AppCard from "../../components/AppCard";
import AppInput from "../../components/AppInput";
import { colorPalette } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { updateOwnerProfile } from "../../services/authService";
import { fetchApi } from "../../services/apiClient";

interface PetData {
  id?: string;
  name?: string;
  referenceCode: string;
  petType: string;
  age: number;
  lastVetVisitDate: string;
  vaccinationRecordUrl: string;
  photoUrl: string;
}

interface ProfileScreenProps {
  ownerName?: string;
  phone?: string;
  onLogout: () => void;
}

export default function ProfileScreen({
  ownerName,
  phone,
  onLogout,
}: ProfileScreenProps) {
  const { user, updateUser } = useAuth() as {
    user?: any;
    updateUser: (updatedUser: any) => void;
  };

  const currentOwnerName =
    ownerName?.trim() ||
    user?.name ||
    user?.user?.name ||
    user?.fullName ||
    "";

  const currentPhone =
    phone?.trim() ||
    user?.phone ||
    user?.user?.phone ||
    user?.phoneNumber ||
    "";

  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [savingOwner, setSavingOwner] = useState(false);
  const [ownerNameInput, setOwnerNameInput] = useState(currentOwnerName);
  const [ownerPhoneInput, setOwnerPhoneInput] = useState(currentPhone);
  const [ownerLocationInput, setOwnerLocationInput] = useState(user?.location || "");
  const [ownerAvatarInput, setOwnerAvatarInput] = useState(user?.avatarUrl || "");

  useEffect(() => {
    queueMicrotask(() => {
      setOwnerNameInput(currentOwnerName);
      setOwnerPhoneInput(currentPhone);
      setOwnerLocationInput(user?.location || "");
      setOwnerAvatarInput(user?.avatarUrl || "");
    });
  }, [currentOwnerName, currentPhone, user?.location, user?.avatarUrl]);

  const pickOwnerAvatar = async () => {
    setPetFeedback(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      setPetFeedback({ type: "error", text: "Avatar must be 5 MB or smaller." });
      return;
    }
    setOwnerAvatarInput(asset.uri);
  };

  const handleSaveOwnerProfile = async () => {
    setPetFeedback(null);
    if (!ownerNameInput.trim() || !/^09\d{8}$/.test(ownerPhoneInput.trim())) {
      setPetFeedback({ type: "error", text: "Please enter a valid name and 10-digit phone number." });
      return;
    }

    setSavingOwner(true);
    try {
      const updated = await updateOwnerProfile({
        name: ownerNameInput.trim(),
        phone: ownerPhoneInput.trim(),
        location: ownerLocationInput.trim() || undefined,
        avatarUrl: ownerAvatarInput.trim() || undefined,
      });
      updateUser(updated);
      setIsEditingOwner(false);
      setPetFeedback({ type: "success", text: "Profile updated successfully." });
    } catch (error: any) {
      setPetFeedback({ type: "error", text: error?.message || "Could not update profile." });
    } finally {
      setSavingOwner(false);
    }
  };

  const [pet, setPet] = useState<PetData | null>(null);
  const [isEditingPet, setIsEditingPet] = useState(false);
  const [savingPet, setSavingPet] = useState(false);

  const [petNameInput, setPetNameInput] = useState("");
  const [petTypeInput, setPetTypeInput] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [lastVetVisitInput, setLastVetVisitInput] = useState("");
  const [vaccinationPdfInput, setVaccinationPdfInput] = useState("");
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [vaccinationPdfName, setVaccinationPdfName] = useState("");
  const [photoName, setPhotoName] = useState("");

  const [petFeedback, setPetFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadPetOwnerProfile() {
      try {
        const res = await fetchApi<any>("/me/profile", { method: "GET" });
        const resData = res?.data || res;
        if (resData && active) {
          if (resData.user) {
            if (resData.user.name) setOwnerNameInput(resData.user.name);
            if (resData.user.phone) setOwnerPhoneInput(resData.user.phone);
          }
          if (Array.isArray(resData.pets) && resData.pets.length > 0) {
            const p = resData.pets[0];
            const normalized: PetData = {
              id: p._id || p.id,
              name: p.name || "",
              referenceCode: p.referenceCode || `PET-${(p._id || "").slice(-6).toUpperCase()}`,
              petType: p.petType || "",
              age: Number(p.age || 0),
              lastVetVisitDate: p.lastVetVisitDate ? String(p.lastVetVisitDate).split("T")[0] : "",
              vaccinationRecordUrl: p.vaccinationRecordUrl || "",
              photoUrl: p.photoUrl || "",
            };

            setPet(normalized);
            setPetNameInput(normalized.name || "");
            setPetTypeInput(normalized.petType);
            setAgeInput(normalized.age ? String(normalized.age) : "");
            setLastVetVisitInput(normalized.lastVetVisitDate);
            setVaccinationPdfInput(normalized.vaccinationRecordUrl);
            setVaccinationPdfName(normalized.vaccinationRecordUrl.split("/").pop() || "Vaccination record");
            setPhotoUrlInput(normalized.photoUrl);
            setPhotoName(normalized.photoUrl.split("/").pop() || "Pet photo");
          }
        }
      } catch (err) {
        // Fallback
      }
    }
    void loadPetOwnerProfile();
    return () => {
      active = false;
    };
  }, [user?.id, user?.name]);

  const handleOpenPetForm = () => {
    setPetFeedback(null);
    if (pet) {
      setPetNameInput(pet.name || "");
      setPetTypeInput(pet.petType);
      setAgeInput(String(pet.age));
      setLastVetVisitInput(pet.lastVetVisitDate);
      setVaccinationPdfInput(pet.vaccinationRecordUrl);
      setVaccinationPdfName(pet.vaccinationRecordUrl.split("/").pop() || "Vaccination record");
      setPhotoUrlInput(pet.photoUrl);
      setPhotoName(pet.photoUrl.split("/").pop() || "Pet photo");
    } else {
      setPetNameInput("");
      setPetTypeInput("");
      setAgeInput("");
      setLastVetVisitInput("");
      setVaccinationPdfInput("");
      setVaccinationPdfName("");
      setPhotoUrlInput("");
      setPhotoName("");
    }
    setIsEditingPet((prev) => !prev);
  };

  const pickVaccinationPdf = async () => {
    setPetFeedback(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    if (asset.mimeType && asset.mimeType !== "application/pdf") {
      setPetFeedback({ type: "error", text: "Only PDF vaccine records are allowed." });
      return;
    }
    if (asset.size && asset.size > 20 * 1024 * 1024) {
      setPetFeedback({ type: "error", text: "Vaccine record must be 20 MB or smaller." });
      return;
    }

    setVaccinationPdfInput(asset.uri);
    setVaccinationPdfName(asset.name);
  };

  const pickPetPhoto = async () => {
    setPetFeedback(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      setPetFeedback({ type: "error", text: "Pet photo must be 5 MB or smaller." });
      return;
    }

    setPhotoUrlInput(asset.uri);
    setPhotoName(asset.fileName || "pet-photo.jpg");
  };

  const handleSavePet = async () => {
    setPetFeedback(null);
    const parsedAge = Number(ageInput.trim());

    if (
      !petTypeInput.trim() ||
      !ageInput.trim() ||
      Number.isNaN(parsedAge) ||
      parsedAge < 0
    ) {
      setPetFeedback({
        type: "error",
        text: "Please enter pet type and a valid age.",
      });
      return;
    }

    const defaultPhoto = "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400";
    const payload: CreatePetPayload = {
      name: petNameInput.trim() || undefined,
      petType: petTypeInput.trim(),
      age: parsedAge,
      lastVetVisitDate: lastVetVisitInput.trim() || new Date().toISOString().split("T")[0],
      vaccinationRecordUrl: vaccinationPdfInput.trim() || "Record on file",
      photoUrl: photoUrlInput.trim() || defaultPhoto,
    };

    setSavingPet(true);
    try {
      const token =
        user?.accessToken ||
        user?.token ||
        user?.data?.accessToken ||
        user?.data?.token;

      const savedFromBackend = await savePetRequest(payload, token, pet?.id);

      const savedPet: PetData = {
        id: savedFromBackend?._id || savedFromBackend?.id || pet?.id,
        name: savedFromBackend?.name || payload.name,
        referenceCode:
          savedFromBackend?.referenceCode ||
          pet?.referenceCode ||
          `PET-${Math.floor(100000 + Math.random() * 900000)}`,
        petType: savedFromBackend?.petType || payload.petType,
        age:
          typeof savedFromBackend?.age === "number"
            ? savedFromBackend.age
            : payload.age,
        lastVetVisitDate:
          savedFromBackend?.lastVetVisitDate || payload.lastVetVisitDate,
        vaccinationRecordUrl:
          savedFromBackend?.vaccinationRecordUrl || payload.vaccinationRecordUrl,
        photoUrl: savedFromBackend?.photoUrl || payload.photoUrl,
      };

      setPet(savedPet);
      updateUser({ pet: savedPet });

      setIsEditingPet(false);
      setPetFeedback({
        type: "success",
        text: "Your pet profile has been saved.",
      });
    } catch (err: any) {
      setPetFeedback({
        type: "error",
        text: err?.message || "Could not save pet details to backend.",
      });
    } finally {
      setSavingPet(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#E4EAF1] dark:bg-[#121820]"
      contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 95 }}
    >
      <View>
        <Text className="text-xs uppercase font-bold text-[#557FB3]">
          PET OWNER ACCOUNT
        </Text>
        <Text className="text-3xl font-extrabold text-[#2A4D75] dark:text-white mt-0.5">
          Profile
        </Text>
      </View>

      {petFeedback ? (
        <View
          className={`px-3.5 py-2.5 rounded-xl border ${
            petFeedback.type === "error"
              ? "bg-red-100 border-red-300"
              : "bg-emerald-100 border-emerald-300"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              petFeedback.type === "error" ? "text-red-800" : "text-emerald-800"
            }`}
          >
            {petFeedback.text}
          </Text>
        </View>
      ) : null}

      <AppCard
        color="bg-white dark:bg-[#1E2733]"
        className="gap-2 border border-slate-200 dark:border-slate-700"
      >
        <View className="flex-row items-center gap-3">
          {ownerAvatarInput ? (
            <Image source={{ uri: ownerAvatarInput }} className="w-11 h-11 rounded-2xl" />
          ) : (
            <View className="w-11 h-11 rounded-2xl bg-[#E4EAF1] dark:bg-slate-800 items-center justify-center">
              <Ionicons name="person" size={22} color={colorPalette.navyDark} />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-base font-extrabold text-[#2A4D75] dark:text-white">
              {currentOwnerName || "No name provided"}
            </Text>
            <Text className="text-xs text-slate-500">
              {currentPhone || "No phone provided"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsEditingOwner((visible) => !visible)}
            className="px-3 py-1.5 rounded-xl bg-[#E4EAF1]"
          >
            <Text className="text-xs font-bold text-[#2A4D75]">
              {isEditingOwner ? "Close" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        {isEditingOwner ? (
          <View className="gap-3 pt-2">
            <AppInput
              leftIcon="person-outline"
              value={ownerNameInput}
              onChangeText={setOwnerNameInput}
              placeholder="Full name"
            />
            <AppInput
              leftIcon="call-outline"
              value={ownerPhoneInput}
              onChangeText={setOwnerPhoneInput}
              placeholder="Phone (09XXXXXXXX)"
              keyboardType="phone-pad"
              maxLength={10}
            />
            <AppInput
              leftIcon="location-outline"
              value={ownerLocationInput}
              onChangeText={setOwnerLocationInput}
              placeholder="Location / address"
            />
            <TouchableOpacity onPress={pickOwnerAvatar} activeOpacity={0.8} className="py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center">
              <Text className="text-xs font-bold text-[#2A4D75] dark:text-slate-200">
                {ownerAvatarInput ? "Change profile photo" : "Add profile photo"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => void handleSaveOwnerProfile()} disabled={savingOwner} className={`py-3.5 rounded-xl items-center ${savingOwner ? "bg-slate-400" : "bg-[#EFBB44]"}`}>
              <Text className="text-xs font-extrabold text-slate-900">{savingOwner ? "Saving..." : "Save Profile"}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </AppCard>

      <AppCard
        color="bg-white dark:bg-[#1E2733]"
        className="gap-3 border border-slate-200 dark:border-slate-700"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Ionicons name="paw" size={20} color={colorPalette.navyDark} />
            <Text className="text-base font-extrabold text-[#2A4D75] dark:text-white">
              Pet Profile
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleOpenPetForm}
            className="px-3 py-1.5 rounded-xl bg-[#E4EAF1]"
          >
            <Text className="text-xs font-bold text-[#2A4D75]">
              {isEditingPet ? "Cancel" : pet ? "Edit Pet" : "Add Pet"}
            </Text>
          </TouchableOpacity>
        </View>

        {!isEditingPet ? (
          pet ? (
            <View className="gap-1.5 pt-1">
              <Text className="text-xs font-bold text-[#557FB3]">
                Reference Code: {pet.referenceCode}
              </Text>
              {pet.name ? (
                <Text className="text-xs text-slate-700 dark:text-slate-200">
                  Name: <Text className="font-bold">{pet.name}</Text>
                </Text>
              ) : null}
              <Text className="text-xs text-slate-700 dark:text-slate-200">
                Pet Type: <Text className="font-bold">{pet.petType}</Text>
              </Text>
              <Text className="text-xs text-slate-700 dark:text-slate-200">
                Age: <Text className="font-bold">{pet.age}</Text>
              </Text>
              <Text className="text-xs text-slate-700 dark:text-slate-200">
                Last Vet Visit:{" "}
                <Text className="font-bold">{pet.lastVetVisitDate}</Text>
              </Text>
              <Text className="text-xs text-slate-700 dark:text-slate-200">
                Vaccination Record (PDF):{" "}
                <Text className="font-bold">
                  {pet.vaccinationRecordUrl.split("/").pop() || pet.vaccinationRecordUrl}
                </Text>
              </Text>
              {pet.photoUrl ? (
                <Image
                  source={{ uri: pet.photoUrl }}
                  className="w-24 h-24 rounded-xl mt-1"
                  resizeMode="cover"
                />
              ) : null}
            </View>
          ) : (
            <Text className="text-xs text-slate-500 pt-1">
              No pet added yet. Tap &quot;Add Pet&quot; to enter your pet&apos;s
              details.
            </Text>
          )
        ) : (
          <View className="gap-3 pt-2">
            <AppInput
              leftIcon="paw-outline"
              value={petNameInput}
              onChangeText={setPetNameInput}
              placeholder="Pet name (e.g. Luna, Max)"
            />
            <AppInput
              leftIcon="pricetag-outline"
              value={petTypeInput}
              onChangeText={setPetTypeInput}
              placeholder="Pet type (e.g. Cat, Dog)"
            />
            <AppInput
              leftIcon="time-outline"
              value={ageInput}
              onChangeText={setAgeInput}
              placeholder="Age (numeric)"
              keyboardType="numeric"
            />
            <AppInput
              leftIcon="calendar-outline"
              value={lastVetVisitInput}
              onChangeText={setLastVetVisitInput}
              placeholder="Last vet visit date (DD-MM-YYYY)"
            />
            <TouchableOpacity
              onPress={pickVaccinationPdf}
              activeOpacity={0.8}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 flex-row items-center gap-3"
            >
              <Ionicons name="document-text-outline" size={22} color={colorPalette.softBlue} />
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#2A4D75]">
                  {vaccinationPdfName || "Upload vaccination record PDF"}
                </Text>
                <Text className="text-xs text-slate-400">PDF only - max 20 MB</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickPetPhoto}
              activeOpacity={0.8}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 flex-row items-center gap-3"
            >
              {photoUrlInput ? (
                <Image source={{ uri: photoUrlInput }} className="w-12 h-12 rounded-lg" />
              ) : (
                <Ionicons name="camera-outline" size={22} color={colorPalette.navyDark} />
              )}
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#2A4D75]">
                  {photoName || "Upload pet photo (Optional)"}
                </Text>
                <Text className="text-xs text-slate-400">Optional · JPG or PNG - max 5 MB</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSavePet}
              disabled={savingPet}
              className={`py-3.5 rounded-xl items-center ${savingPet ? "bg-slate-400" : "bg-[#EFBB44]"}`}
            >
              <Text className="text-xs font-extrabold text-slate-900">
                {savingPet ? "Saving..." : "Save Pet"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </AppCard>

      {!showLogoutConfirm ? (
        <TouchableOpacity
          onPress={() => setShowLogoutConfirm(true)}
          activeOpacity={0.85}
          className="mt-1 py-3.5 rounded-2xl bg-[#2A4D75] items-center flex-row justify-center gap-2"
        >
          <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
          <Text className="text-sm font-bold text-white">Log Out</Text>
        </TouchableOpacity>
      ) : (
        <AppCard
          color="bg-white dark:bg-[#1E2733]"
          className="gap-3 border border-slate-200 dark:border-slate-700"
        >
          <Text className="text-sm font-bold text-[#2A4D75] dark:text-white">
            Are you sure you want to logout?
          </Text>
          <View className="flex-row gap-2.5">
            <TouchableOpacity
              onPress={() => setShowLogoutConfirm(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 border border-slate-300 items-center"
            >
              <Text className="text-xs font-bold text-[#2A4D75]">No</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onLogout}
              className="flex-1 py-2.5 rounded-xl bg-[#2A4D75] items-center"
            >
              <Text className="text-xs font-bold text-white">Logout</Text>
            </TouchableOpacity>
          </View>
        </AppCard>
      )}
    </ScrollView>
  );
}