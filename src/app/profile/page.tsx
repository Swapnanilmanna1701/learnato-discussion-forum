"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/image-upload";
import { Loader2, User as UserIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  bio?: string | null;
  createdAt: Date;
};

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    image: "",
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.name,
        bio: data.bio || "",
        image: data.image || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    if (!formData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/users/${profile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          bio: formData.bio.trim(),
          image: formData.image || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        bio: profile.bio || "",
        image: profile.image || "",
      });
    }
    setIsEditing(false);
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData({ ...formData, image: imageUrl });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forum
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <UserIcon className="h-6 w-6" />
                  My Profile
                </CardTitle>
                <CardDescription>
                  Manage your account information
                </CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Image */}
            <div>
              <Label className="mb-3 block">Profile Photo</Label>
              {isEditing ? (
                <ImageUpload
                  currentImage={formData.image}
                  onImageUploaded={handleImageUploaded}
                  userName={formData.name}
                />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {profile.image ? (
                      <img
                        src={profile.image}
                        alt={profile.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  disabled={isSaving}
                />
              ) : (
                <p className="text-foreground">{profile.name}</p>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <p className="text-muted-foreground text-sm">{profile.email}</p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  disabled={isSaving}
                />
              ) : (
                <p className="text-foreground">
                  {profile.bio || <span className="text-muted-foreground italic">No bio added yet</span>}
                </p>
              )}
            </div>

            {/* Member Since */}
            <div className="space-y-2">
              <Label>Member Since</Label>
              <p className="text-muted-foreground text-sm">
                {formatDate(profile.createdAt)}
              </p>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
