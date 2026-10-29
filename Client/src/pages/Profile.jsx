import { useCallback, useEffect, useState } from "react";

import {

  UserRound,

  Package,

  History,

  Star,

  Settings,

  LogOut,

  ChevronRight,

  Mail,
  ShieldCheck,
  ArrowUpRight,

  Store,

  Clock3,

  BadgeCheck,

  Camera,

  LoaderCircle,

  FileCheck2,

  Upload,

  X,

} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import MyOrders from "./MyOrders";
import { resolveImage } from "../utils/productHelpers";

import "./Profile.css";

import "./ProfileSeller.css";

const API_BASE = "http://localhost:5000/api";

const SHOP_API_URL = `${API_BASE}/shop/me`;

const APPLICATION_API_URL = `${API_BASE}/shop/application/me`;

const APPLY_API_URL = `${API_BASE}/shop/apply`;

const PROFILE_IMAGE_API_URL = `${API_BASE}/auth/profile-image`;

const SESSION_API_URL = `${API_BASE}/auth/session`;

const MAX_IDENTITY_SIZE = 5 * 1024 * 1024; // 5 MB

const menuItems = [

  { id: "profile", label: "My Profile", icon: UserRound },

  { id: "orders", label: "My Orders", icon: Package },

  { id: "history", label: "Purchase History", icon: History },

  { id: "reviews", label: "My Reviews", icon: Star },

  { id: "settings", label: "Settings", icon: Settings },

];

const emptySellerForm = {

  shopName: "",

  shopDescription: "",

  fullName: "",

};

function readStoredUser() {

  try {

    return JSON.parse(localStorage.getItem("user")) || null;

  } catch {

    return null;

  }

}

function isSellerRole(user) {

  return ["seller", "admin"].includes(String(user?.role || "").toLowerCase());

}

function authHeaders() {

  const token = localStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : {};

}

// Jangan crash kalau server membalas HTML (misalnya 404 "Cannot PUT")

async function readJson(response) {

  try {

    return await response.json();

  } catch {

    return {};

  }

}

function formatDate(value) {

  if (!value) return "";

  return new Date(value).toLocaleDateString("id-ID", {

    day: "numeric",

    month: "long",

    year: "numeric",

  });

}

export default function Profile() {

  const navigate = useNavigate();

  const location = useLocation();

  const [activeMenu, setActiveMenu] = useState(

    location.state?.activeMenu || "profile"

  );

  useEffect(() => {

    const requestedMenu = location.state?.activeMenu;

    if (requestedMenu && menuItems.some((item) => item.id === requestedMenu)) {

      setActiveMenu(requestedMenu);

    }

  }, [location.state]);

  const [user, setUser] = useState(readStoredUser);
  const [newEmail, setNewEmail] = useState(() => readStoredUser()?.email || "");
  const [confirmingEmailChange, setConfirmingEmailChange] = useState(false);
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [passwordCurrentPassword, setPasswordCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [shopProfile, setShopProfile] = useState({

    shopName: "",

    shopDescription: "",

    shopImage: "",

  });

  // Foto profil

  const [profileImage, setProfileImage] = useState(

    readStoredUser()?.profileImage || ""

  );

  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);

  const [profileImageError, setProfileImageError] = useState("");

  const [profileImageMessage, setProfileImageMessage] = useState("");

  // Pengajuan seller

  const [application, setApplication] = useState(null);

  const [applicationLoading, setApplicationLoading] = useState(false);

  const [submittingApplication, setSubmittingApplication] = useState(false);

  const [applicationError, setApplicationError] = useState("");

  const [applicationMessage, setApplicationMessage] = useState("");

  const [showApplyForm, setShowApplyForm] = useState(false);

  const [approvalNotice, setApprovalNotice] = useState(false);

  const [sellerForm, setSellerForm] = useState(emptySellerForm);

  const [identityFile, setIdentityFile] = useState(null);

  const [identityPreview, setIdentityPreview] = useState("");

  // Purchase History
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // My Reviews
  const [myReviews, setMyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  const loadPurchaseHistory = useCallback(async () => {
    if (!localStorage.getItem("token")) return;

    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await fetch(`${API_BASE}/orders/mine`, {
        headers: authHeaders(),
      });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load purchase history.");
      }

      const orders = Array.isArray(data)
        ? data
        : Array.isArray(data.orders)
          ? data.orders
          : [];

      setPurchaseHistory(
        orders.filter((order) =>
          ["completed", "cancelled"].includes(
            String(order.status || "").toLowerCase()
          )
        )
      );
    } catch (error) {
      setHistoryError(error.message || "Failed to load purchase history.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadMyReviews = useCallback(async () => {
    if (!localStorage.getItem("token")) return;

    setReviewsLoading(true);
    setReviewsError("");

    try {
      const response = await fetch(`${API_BASE}/reviews/mine`, {
        headers: authHeaders(),
      });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load your reviews.");
      }

      setMyReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (error) {
      setReviewsError(error.message || "Failed to load your reviews.");
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const isSeller = isSellerRole(user);

  // Sinkronkan role & foto profil dengan database (mis. baru di-approve jadi seller)

  const syncSession = useCallback(async () => {

    if (!localStorage.getItem("token")) return;

    try {

      const response = await fetch(SESSION_API_URL, {

        headers: authHeaders(),

      });

      const data = await readJson(response);

      if (!response.ok || !data.user) return;

      const stored = readStoredUser() || {};

      const updatedUser = { ...stored, ...data.user };

      const roleChanged = stored.role !== updatedUser.role;

      const imageChanged =

        (stored.profileImage || "") !== (updatedUser.profileImage || "");

      if (data.token) {

        localStorage.setItem("token", data.token);

      }

      if (roleChanged || imageChanged || data.token) {

        localStorage.setItem("user", JSON.stringify(updatedUser));

        setUser(updatedUser);

        setProfileImage(updatedUser.profileImage || "");

        window.dispatchEvent(new Event("authChanged"));

      }

      if (roleChanged && isSellerRole(updatedUser)) {

        setApprovalNotice(true);

      }

    } catch {

      // Biarkan halaman tetap bisa dipakai kalau server tidak terjangkau

    }

  }, []);

  const loadShopProfile = useCallback(async () => {

    if (!isSellerRole(readStoredUser())) return;

    try {

      const response = await fetch(SHOP_API_URL, { headers: authHeaders() });

      const data = await readJson(response);

      if (!response.ok) return;

      setShopProfile({

        shopName: data.shop?.shopName || "",

        shopDescription: data.shop?.shopDescription || "",

        shopImage: data.shop?.shopImage || "",

      });

    } catch {

      // Abaikan kalau profil toko belum bisa dimuat

    }

  }, []);

  const loadApplication = useCallback(async () => {

    if (

      !localStorage.getItem("token") ||

      isSellerRole(readStoredUser())

    ) {

      return;

    }

    setApplicationLoading(true);

    try {

      const response = await fetch(APPLICATION_API_URL, {

        headers: authHeaders(),

      });

      const data = await readJson(response);

      if (response.ok) setApplication(data.application || null);

    } catch {

      // Form pengajuan tetap tampil kalau belum ada aplikasi

    } finally {

      setApplicationLoading(false);

    }

  }, []);

  useEffect(() => {

    const syncUser = () => {

      const current = readStoredUser();

      setUser(current);

      setProfileImage(current?.profileImage || "");

    };

    window.addEventListener("authChanged", syncUser);

    window.addEventListener("shopProfileUpdated", loadShopProfile);

    (async () => {

      await syncSession();

      await Promise.all([loadShopProfile(), loadApplication()]);

    })();

    return () => {

      window.removeEventListener("authChanged", syncUser);

      window.removeEventListener("shopProfileUpdated", loadShopProfile);

    };

  }, [syncSession, loadShopProfile, loadApplication]);

  useEffect(() => {
    if (activeMenu === "history") {
      loadPurchaseHistory();
    }

    if (activeMenu === "reviews") {
      loadMyReviews();
    }
  }, [activeMenu, loadPurchaseHistory, loadMyReviews]);

  // Bersihkan object URL preview KTP

  useEffect(() => {

    return () => {

      if (identityPreview) URL.revokeObjectURL(identityPreview);

    };

  }, [identityPreview]);

  async function handleProfileImageChange(event) {

    const file = event.target.files?.[0];

    event.target.value = "";

    setProfileImageError("");

    setProfileImageMessage("");

    if (!file) return;

    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {

      setProfileImageError("Please choose a JPG, PNG, or WebP image.");

      return;

    }

    if (file.size > 500 * 1024) {

      setProfileImageError("Profile image must be 500 KB or smaller.");

      return;

    }

    if (!localStorage.getItem("token")) {

      navigate("/login");

      return;

    }

    setUploadingProfileImage(true);

    try {

      const imageData = await new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);

        reader.onerror = () =>

          reject(new Error("Could not read the selected image."));

        reader.readAsDataURL(file);

      });

      const response = await fetch(PROFILE_IMAGE_API_URL, {

        method: "PUT",

        headers: {

          "Content-Type": "application/json",

          ...authHeaders(),

        },

        body: JSON.stringify({ profileImage: imageData }),

      });

      const data = await readJson(response);

      if (!response.ok) {

        throw new Error(

          data.message || `Could not update profile photo (${response.status}).`

        );

      }

      const updatedUser = {

        ...readStoredUser(),

        ...(data.user || {}),

        profileImage: data.user?.profileImage || imageData,

      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);

      setProfileImage(updatedUser.profileImage);

      if (isSellerRole(updatedUser)) {

        setShopProfile((previous) => ({

          ...previous,

          shopImage: updatedUser.profileImage,

        }));

        window.dispatchEvent(new Event("shopProfileUpdated"));

      }

      window.dispatchEvent(new Event("authChanged"));

      setProfileImageMessage("Profile photo updated successfully.");

    } catch (error) {

      setProfileImageError(

        error.message || "Could not update profile photo. Please try again."

      );

    } finally {

      setUploadingProfileImage(false);

    }

  }

  function beginEmailChange(event) {
    event.preventDefault();
    setEmailError("");
    setEmailMessage("");

    const email = newEmail.trim().toLowerCase();
    if (!email) {
      setEmailError("Enter your new email address.");
      return;
    }

    setNewEmail(email);
    setConfirmingEmailChange(true);
  }

  async function handleEmailChange(event) {
    event.preventDefault();
    setEmailError("");
    setEmailMessage("");

    const email = newEmail.trim().toLowerCase();
    if (!email || !emailCurrentPassword) {
      setEmailError("Enter your new email and current password.");
      return;
    }

    setSavingEmail(true);
    try {
      const response = await fetch(`${API_BASE}/auth/email`, {
        method: "PUT",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, currentPassword: emailCurrentPassword }),
      });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Could not update email address.");
      }

      const updatedUser = { ...readStoredUser(), ...(data.user || {}), email };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setNewEmail(email);
      setEmailCurrentPassword("");
      setConfirmingEmailChange(false);
      setEmailMessage(data.message || "Email address updated successfully.");
      window.dispatchEvent(new Event("authChanged"));
    } catch (error) {
      setEmailError(error.message || "Could not update email address.");
    } finally {
      setSavingEmail(false);
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (!passwordCurrentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("Complete all password fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const response = await fetch(`${API_BASE}/auth/password`, {
        method: "PUT",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordCurrentPassword,
          newPassword,
          confirmPassword: confirmNewPassword,
        }),
      });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Could not update password.");
      }

      setPasswordCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordMessage(data.message || "Password updated successfully.");
    } catch (error) {
      setPasswordError(error.message || "Could not update password.");
    } finally {
      setSavingPassword(false);
    }
  }

  function handleLogout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.dispatchEvent(new Event("authChanged"));

    navigate("/");

  }

  function updateSellerForm(event) {

    const { name, value } = event.target;

    setSellerForm((previous) => ({ ...previous, [name]: value }));

  }

  function handleIdentityFileChange(event) {

    const file = event.target.files?.[0];

    event.target.value = "";

    setApplicationError("");

    if (!file) return;

    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {

      setApplicationError("Please choose a JPG, PNG, or WebP photo of your KTP.");

      return;

    }

    if (file.size > MAX_IDENTITY_SIZE) {

      setApplicationError("KTP photo must be 5 MB or smaller.");

      return;

    }

    setIdentityFile(file);

    setIdentityPreview(URL.createObjectURL(file));

  }

  function clearIdentityFile() {

    setIdentityFile(null);

    setIdentityPreview("");

  }

  function startReapply() {

    setSellerForm({

      shopName: application?.shopName || "",

      shopDescription: application?.shopDescription || "",

      fullName: application?.fullName || "",

    });

    clearIdentityFile();

    setApplicationError("");

    setApplicationMessage("");

    setShowApplyForm(true);

  }

  async function handleActivateSeller() {

    setApplicationLoading(true);

    await syncSession();

    setApplicationLoading(false);

  }

  async function handleSellerApplication(event) {

    event.preventDefault();

    setApplicationError("");

    setApplicationMessage("");

    if (!localStorage.getItem("token")) {

      navigate("/login");

      return;

    }

    const shopName = sellerForm.shopName.trim();

    const shopDescription = sellerForm.shopDescription.trim();

    const fullName = sellerForm.fullName.trim();

    if (!shopName || shopName.length > 100) {

      setApplicationError("Shop name must contain 1–100 characters.");

      return;

    }

    if (!fullName || fullName.length > 150) {

      setApplicationError("Enter your full name as shown on your KTP.");

      return;

    }

    if (!identityFile) {

      setApplicationError("Please upload a photo of your KTP.");

      return;

    }

    setSubmittingApplication(true);

    try {

      const formData = new FormData();

      formData.append("shopName", shopName);

      formData.append("shopDescription", shopDescription);

      formData.append("fullName", fullName);

      formData.append("identityPhoto", identityFile);

      // Jangan set Content-Type manual, browser yang mengisi boundary multipart

      const response = await fetch(APPLY_API_URL, {

        method: "POST",

        headers: authHeaders(),

        body: formData,

      });

      const data = await readJson(response);

      if (!response.ok) {

        throw new Error(

          data.message ||

            `Unable to submit seller application (${response.status}).`

        );

      }

      setApplication(data.application);

      setShowApplyForm(false);

      setSellerForm(emptySellerForm);

      clearIdentityFile();

      setApplicationMessage(

        "Your seller application has been submitted for review."

      );

    } catch (error) {

      setApplicationError(

        error.message || "Unable to submit your application. Please try again."

      );

    } finally {

      setSubmittingApplication(false);

    }

  }

  function renderSellerSection() {

    // 1. Sudah jadi seller

    if (isSeller) {

      return (

        <div className="seller-link-card">

          <div className="seller-link-icon">

            <Store size={23} />

          </div>

          <div className="seller-link-copy">

            {approvalNotice && (

              <div

                className="seller-form-alert success"

                style={{ marginTop: 0, marginBottom: 14 }}

              >

                Congratulations! Your application was approved. You are now a

                ShopEZ seller.

              </div>

            )}

            <span className="profile-eyebrow">SELLER CENTER</span>

            <h3>{shopProfile.shopName || "Your Shop"}</h3>

            <p>

              Your seller account is active. Manage your shop profile and

              products in Seller Center.

            </p>

            <button

              type="button"

              className="profile-primary-button"

              onClick={() => navigate("/seller/shop")}

            >

              Open My Shop <ArrowUpRight size={17} />

            </button>

          </div>

        </div>

      );

    }

    // 2. Menunggu verifikasi

    if (application?.status === "pending") {

      return (

        <div className="seller-application-status">

          <div className="seller-status-icon pending">

            <Clock3 size={24} />

          </div>

          <div>

            <span className="profile-eyebrow">SELLER APPLICATION</span>

            <h3>Verification in progress</h3>

            <p>

              Your application for <strong>{application.shopName}</strong>

              {application.submittedAt

                ? ` was submitted on ${formatDate(application.submittedAt)}`

                : " was submitted"}

              . We are checking your KTP manually. Your account stays a buyer

              account until it is approved.

            </p>

            <span className="seller-status-pill pending">

              Pending verification

            </span>

          </div>

        </div>

      );

    }

    // 3. Sudah di-approve tapi role belum tersinkron

    if (application?.status === "approved") {

      return (

        <div className="seller-application-status">

          <div className="seller-status-icon approved">

            <BadgeCheck size={24} />

          </div>

          <div>

            <span className="profile-eyebrow">SELLER APPLICATION</span>

            <h3>Your application was approved</h3>

            <p>Activate your seller access to start managing your shop.</p>

            <button

              type="button"

              className="profile-primary-button"

              onClick={handleActivateSeller}

              disabled={applicationLoading}

              style={{ marginTop: 14 }}

            >

              {applicationLoading ? (

                <LoaderCircle size={17} className="seller-spinner" />

              ) : (

                <BadgeCheck size={17} />

              )}

              Activate seller account

            </button>

          </div>

        </div>

      );

    }

    // 4. Ditolak

    if (application?.status === "rejected" && !showApplyForm) {

      return (

        <div className="seller-application-status">

          <div className="seller-status-icon rejected">

            <FileCheck2 size={24} />

          </div>

          <div>

            <span className="profile-eyebrow">SELLER APPLICATION</span>

            <h3>More information is needed</h3>

            <p>

              {application.reviewNote ||

                "Your application was not approved. Please check your information and KTP photo, then apply again."}

            </p>

            <button

              type="button"

              className="profile-secondary-button"

              onClick={startReapply}

              style={{ marginTop: 14 }}

            >

              Update application <ChevronRight size={17} />

            </button>

          </div>

        </div>

      );

    }

    // 5. Belum pernah apply (atau mau apply ulang): tampilkan form

    return (

      <div className="seller-application-card">

        <div className="seller-application-intro">

          <div className="seller-link-icon">

            <Store size={23} />

          </div>

          <div>

            <span className="profile-eyebrow">START SELLING ON SHOPEZ</span>

            <h3>Become a Seller</h3>

            <p>

              Tell us about your shop and upload a photo of your KTP. Seller

              access is enabled after your application is reviewed.

            </p>

          </div>

        </div>

        {applicationError && (

          <div className="seller-form-alert error">{applicationError}</div>

        )}

        {applicationMessage && (

          <div className="seller-form-alert success">{applicationMessage}</div>

        )}

        <form

          className="seller-application-form"

          onSubmit={handleSellerApplication}

        >

          <label>

            Shop name <span aria-hidden="true">*</span>

            <input

              name="shopName"

              value={sellerForm.shopName}

              onChange={updateSellerForm}

              maxLength={100}

              placeholder="e.g. Winny's Tech Store"

              required

            />

          </label>

          <label>

            Shop description

            <textarea

              name="shopDescription"

              value={sellerForm.shopDescription}

              onChange={updateSellerForm}

              maxLength={1000}

              rows={3}

              placeholder="What products will you sell?"

            />

          </label>

          <label>

            Full name as shown on your KTP <span aria-hidden="true">*</span>

            <input

              name="fullName"

              value={sellerForm.fullName}

              onChange={updateSellerForm}

              maxLength={150}

              autoComplete="name"

              placeholder="Enter your full name"

              required

            />

          </label>

          <div className="seller-ktp-field">

            <span className="seller-ktp-label">

              KTP photo <span aria-hidden="true">*</span>

            </span>

            {identityPreview ? (

              <div className="seller-identity-preview">

                <img src={identityPreview} alt="KTP preview" />

                <button

                  type="button"

                  className="seller-identity-remove"

                  onClick={clearIdentityFile}

                  aria-label="Remove KTP photo"

                  disabled={submittingApplication}

                >

                  <X size={15} />

                </button>

              </div>

            ) : (

              <label className="seller-dropzone">

                <Upload size={22} />

                <strong>Upload KTP photo</strong>

                <small>JPG, PNG, or WebP · Maximum 5 MB</small>

                <input

                  type="file"

                  accept="image/jpeg,image/png,image/webp"

                  onChange={handleIdentityFileChange}

                />

              </label>

            )}

          </div>

          <p className="seller-privacy-note">

            <ShieldCheck size={15} /> Your KTP photo is only used to verify

            this application. It is stored privately and is never shown to

            other users.

          </p>

          <button

            type="submit"

            className="profile-primary-button seller-submit-button"

            disabled={submittingApplication || applicationLoading}

          >

            {submittingApplication ? (

              <LoaderCircle size={17} className="seller-spinner" />

            ) : (

              <ShieldCheck size={17} />

            )}

            {submittingApplication ? "Submitting..." : "Submit for Verification"}

          </button>

          <p className="seller-review-footnote">

            Seller access is granted only after your application is approved.

          </p>

        </form>

      </div>

    );

  }

  function renderContent() {

    switch (activeMenu) {

      case "profile":

        return (

          <>

            <div className="profile-content-heading">

              <div>

                <span className="profile-eyebrow">ACCOUNT OVERVIEW</span>

                <h2>My Profile</h2>

                <p>Manage your personal information and seller account.</p>

              </div>

            </div>

            <div className="profile-identity">

              <div className="profile-avatar-wrap">

                <div className="profile-avatar">

                  {profileImage ? (

                    <img

                      src={profileImage}

                      alt="Profile"

                      className="profile-avatar-image"

                    />

                  ) : (

                    <UserRound size={34} strokeWidth={1.5} />

                  )}

                </div>

                <label

                  className={`profile-photo-upload ${

                    uploadingProfileImage ? "is-uploading" : ""

                  }`}

                  title="Change profile photo"

                >

                  <input

                    type="file"

                    accept="image/jpeg,image/png,image/webp"

                    onChange={handleProfileImageChange}

                    disabled={uploadingProfileImage}

                  />

                  {uploadingProfileImage ? (

                    <LoaderCircle size={15} className="seller-spinner" />

                  ) : (

                    <Camera size={15} />

                  )}

                </label>

              </div>

              <div>

                <h3>{user?.name || "ShopEZ User"}</h3>

                <p>{user?.email || "No email available"}</p>

                <span className="profile-member-badge">

                  {isSeller ? (

                    <BadgeCheck size={14} />

                  ) : (

                    <ShieldCheck size={14} />

                  )}

                  {isSeller ? "Verified Seller Account" : "ShopEZ Member"}

                </span>

                <p className="profile-photo-help">

                  JPG, PNG, or WebP · max 500 KB.{" "}

                  {isSeller

                    ? "Your profile photo is also used as your shop photo."

                    : "You can change this photo anytime."}

                </p>

                {profileImageError && (

                  <p className="profile-photo-feedback error">

                    {profileImageError}

                  </p>

                )}

                {profileImageMessage && (

                  <p className="profile-photo-feedback success">

                    {profileImageMessage}

                  </p>

                )}

              </div>

            </div>

            <div className="profile-section-card">

              <div className="profile-section-title">

                <h3>Personal Information</h3>

              </div>

              <div className="profile-detail-grid">

                <div className="profile-detail">

                  <span>Full Name</span>

                  <strong>{user?.name || "Not provided"}</strong>

                </div>

                <div className="profile-detail">

                  <span>Email Address</span>

                  <strong>{user?.email || "Not provided"}</strong>

                </div>

              </div>

              <p className="profile-note">

                Your account details are based on the account you used to sign

                in.

              </p>

            </div>

            <div className="seller-section-wrap">{renderSellerSection()}</div>

          </>

        );

      case "orders":

        return <MyOrders embedded />;

      case "history":
        return (
          <div className="profile-activity-section profile-history-section">
            <div className="profile-content-heading profile-history-heading">
              <div>
                <span className="profile-eyebrow">YOUR TRANSACTIONS</span>
                <h2>Purchase History</h2>
                <p>View your completed and cancelled transactions.</p>
              </div>
              {!historyLoading && !historyError && purchaseHistory.length > 0 && (
                <span className="profile-history-count">
                  {purchaseHistory.length}{" "}
                  {purchaseHistory.length === 1 ? "order" : "orders"}
                </span>
              )}
            </div>

            {historyLoading ? (
              <div className="profile-history-state" role="status">
                <LoaderCircle size={24} className="seller-spinner" />
                <p>Loading purchase history...</p>
              </div>
            ) : historyError ? (
              <div className="profile-history-state profile-history-error" role="alert">
                <p>{historyError}</p>
                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={loadPurchaseHistory}
                >
                  Try Again
                </button>
              </div>
            ) : purchaseHistory.length === 0 ? (
              <div className="profile-empty-state profile-history-empty">
                <div className="profile-empty-icon">
                  <History size={30} />
                </div>
                <span className="profile-eyebrow">YOUR TRANSACTIONS</span>
                <h2>No Purchase History Yet</h2>
                <p>Your completed and cancelled transactions will appear here.</p>
                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={() => navigate("/catalogue")}
                >
                  Browse Products <ChevronRight size={17} />
                </button>
              </div>
            ) : (
              <div className="profile-history-list">
                {purchaseHistory.map((order) => {
                  const seller =
                    order.seller && typeof order.seller === "object"
                      ? order.seller
                      : null;
                  const sellerId = seller?._id || seller?.id;
                  const shopName = seller?.name || seller?.shopName || "ShopEZ Store";
                  const shopImage = seller?.profileImage || seller?.shopImage;
                  const shopContent = (
                    <>
                      <span className="profile-history-shop-avatar">
                        {shopImage ? (
                          <img src={resolveImage(shopImage)} alt="" />
                        ) : (
                          <Store size={17} />
                        )}
                      </span>
                      <span>
                        <small>Purchased from</small>
                        <strong>{shopName}</strong>
                      </span>
                      {sellerId && <ArrowUpRight size={16} />}
                    </>
                  );

                  return (
                    <article className="profile-history-card" key={order._id}>
                      <div className="profile-history-card-top">
                        <div>
                          <span className="profile-history-label">ORDER</span>
                          <strong>{order.orderNumber || order._id}</strong>
                        </div>
                        <span
                          className={`profile-history-status ${
                            String(order.status).toLowerCase() === "completed"
                              ? "completed"
                              : "cancelled"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {sellerId ? (
                        <Link
                          to={`/shop/${sellerId}`}
                          className="profile-history-shop"
                          aria-label={`Visit ${shopName}`}
                        >
                          {shopContent}
                        </Link>
                      ) : (
                        <div className="profile-history-shop is-unlinked">
                          {shopContent}
                        </div>
                      )}

                      <div className="profile-history-items">
                        {(order.items || []).map((item, index) => {
                          const product =
                            item.product && typeof item.product === "object"
                              ? item.product
                              : {};
                          const productName =
                            item.name || product.name || product.title || "Product";
                          const productImage =
                            item.image ||
                            product.image ||
                            product.images?.[0] ||
                            "";

                          return (
                            <div
                              className="profile-history-item"
                              key={item._id || `${order._id}-${index}`}
                            >
                              <span className="profile-history-item-image">
                                {productImage ? (
                                  <img
                                    src={resolveImage(productImage)}
                                    alt={productName}
                                  />
                                ) : (
                                  <Package size={19} />
                                )}
                              </span>
                              <span className="profile-history-item-info">
                                <strong>{productName}</strong>
                                <small>Qty {item.quantity || 1}</small>
                              </span>
                              <strong className="profile-history-item-price">
                                Rp {Number(item.price || 0).toLocaleString("id-ID")}
                              </strong>
                            </div>
                          );
                        })}
                      </div>

                      <div className="profile-history-card-bottom">
                        <span>
                          {formatDate(order.createdAt) || "-"}
                        </span>
                        <span>
                          Total{" "}
                          <strong>
                            Rp{" "}
                            {Number(order.total ?? order.totalAmount ?? 0).toLocaleString("id-ID")}
                          </strong>
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "reviews":
        return (
          <div className="profile-activity-section profile-reviews-section">
            <div className="profile-content-heading profile-reviews-heading">
              <div>
                <span className="profile-eyebrow">YOUR FEEDBACK</span>
                <h2>My Reviews</h2>
                <p>All the ratings and reviews you have shared on ShopEZ.</p>
              </div>
              {!reviewsLoading && !reviewsError && myReviews.length > 0 && (
                <span className="profile-review-count">
                  <Star size={15} />
                  {myReviews.length} {myReviews.length === 1 ? "review" : "reviews"}
                </span>
              )}
            </div>

            {reviewsLoading ? (
              <div className="profile-reviews-state" role="status">
                <LoaderCircle size={24} className="seller-spinner" />
                <p>Loading your reviews...</p>
              </div>
            ) : reviewsError ? (
              <div className="profile-reviews-state profile-reviews-error" role="alert">
                <p>{reviewsError}</p>
                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={loadMyReviews}
                >
                  Try Again
                </button>
              </div>
            ) : myReviews.length === 0 ? (
              <div className="profile-empty-state profile-reviews-empty">
                <div className="profile-empty-icon">
                  <Star size={30} />
                </div>
                <span className="profile-eyebrow">YOUR FEEDBACK</span>
                <h2>No Reviews Yet</h2>
                <p>Products you have reviewed will appear here.</p>
                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={() => navigate("/catalogue")}
                >
                  Browse Products <ChevronRight size={17} />
                </button>
              </div>
            ) : (
              <div className="profile-reviews-list">
                {myReviews.map((review) => {
                  const product =
                    review.product && typeof review.product === "object"
                      ? review.product
                      : null;
                  const productName =
                    product?.name || product?.title || "Product";
                  const productImage =
                    product?.images?.[0] || product?.image || "";
                  const seller =
                    product?.seller && typeof product.seller === "object"
                      ? product.seller
                      : null;
                  const sellerId = seller?._id || seller?.id;
                  const shopName = seller?.name || seller?.shopName || "ShopEZ Store";
                  const shopImage = seller?.profileImage || seller?.shopImage;

                  return (
                    <article className="profile-review-card" key={review._id}>
                      <div className="profile-review-card-header">
                        <div className="profile-review-product">
                          <div className="profile-activity-image profile-review-image">
                            {productImage ? (
                              <img
                                src={resolveImage(productImage)}
                                alt={productName}
                              />
                            ) : (
                              <Package size={23} />
                            )}
                          </div>
                          <div className="profile-activity-product-info">
                            <strong>{productName}</strong>
                          </div>
                        </div>
                        <span className="profile-review-date">
                          {formatDate(review.createdAt) || "-"}
                        </span>
                      </div>

                      {sellerId && (
                        <Link
                          to={`/shop/${sellerId}`}
                          className="profile-review-shop"
                          aria-label={`Visit ${shopName}`}
                        >
                          <span className="profile-review-shop-avatar">
                            {shopImage ? (
                              <img src={resolveImage(shopImage)} alt="" />
                            ) : (
                              <Store size={14} />
                            )}
                          </span>
                          <span>
                            <small>From this shop</small>
                            <strong>{shopName}</strong>
                          </span>
                          <ArrowUpRight size={15} />
                        </Link>
                      )}

                      <div
                        className="profile-review-rating"
                        aria-label={`${review.rating} out of 5 stars`}
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={
                              star <= Number(review.rating)
                                ? "profile-review-star-active"
                                : "profile-review-star-inactive"
                            }
                            size={17}
                            fill={star <= Number(review.rating) ? "currentColor" : "none"}
                          />
                        ))}
                        <strong>{review.rating}/5</strong>
                      </div>

                      <p className="profile-review-comment">
                        {review.comment?.trim() || "You left a rating without a written comment."}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "settings":

        return (

          <>

            <div className="profile-content-heading">

              <div>

                <span className="profile-eyebrow">PREFERENCES & SECURITY</span>

                <h2>Settings</h2>

                <p>Manage your account preferences.</p>

              </div>

            </div>

            <div className="profile-setting-card">
              <div className="profile-setting-icon">
                <Mail size={21} />
              </div>
              <div className="profile-setting-info">
                <h3>Email Address</h3>
                <p>Current email: {user?.email || "No email available"}</p>
                <form
                  className="profile-setting-form"
                  onSubmit={
                    confirmingEmailChange
                      ? handleEmailChange
                      : beginEmailChange
                  }
                >
                  {confirmingEmailChange ? (
                    <>
                      <p className="profile-setting-confirmation">
                        New email: <strong>{newEmail}</strong>
                      </p>
                      <label>
                        Enter your current password to continue
                        <input
                          type="password"
                          value={emailCurrentPassword}
                          onChange={(event) =>
                            setEmailCurrentPassword(event.target.value)
                          }
                          autoComplete="current-password"
                          required
                          autoFocus
                        />
                      </label>
                    </>
                  ) : (
                    <label>
                      New email address
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(event) => setNewEmail(event.target.value)}
                        autoComplete="email"
                        required
                      />
                    </label>
                  )}
                  {emailError && (
                    <p className="profile-setting-feedback error" role="alert">
                      {emailError}
                    </p>
                  )}
                  {emailMessage && (
                    <p className="profile-setting-feedback success" role="status">
                      {emailMessage}
                    </p>
                  )}
                  <div className="profile-setting-actions">
                    <button
                      type="submit"
                      className="profile-primary-button"
                      disabled={savingEmail}
                    >
                      {confirmingEmailChange
                        ? savingEmail
                          ? "Updating..."
                          : "Confirm Email Change"
                        : "Update Email"}
                    </button>
                    {confirmingEmailChange && (
                      <button
                        type="button"
                        className="profile-secondary-button"
                        disabled={savingEmail}
                        onClick={() => {
                          setConfirmingEmailChange(false);
                          setEmailCurrentPassword("");
                          setEmailError("");
                        }}
                      >
                        Back
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="profile-setting-card">
              <div className="profile-setting-icon">
                <ShieldCheck size={21} />
              </div>
              <div className="profile-setting-info">
                <h3>Password & Security</h3>
                <p>Choose a password with at least 8 characters.</p>
                <form
                  className="profile-setting-form"
                  onSubmit={handlePasswordChange}
                >
                  <label>
                    Current password
                    <input
                      type="password"
                      value={passwordCurrentPassword}
                      onChange={(event) =>
                        setPasswordCurrentPassword(event.target.value)
                      }
                      autoComplete="current-password"
                      required
                    />
                  </label>
                  <label>
                    New password
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </label>
                  <label>
                    Confirm new password
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(event) =>
                        setConfirmNewPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </label>
                  {passwordError && (
                    <p className="profile-setting-feedback error" role="alert">
                      {passwordError}
                    </p>
                  )}
                  {passwordMessage && (
                    <p className="profile-setting-feedback success" role="status">
                      {passwordMessage}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="profile-primary-button"
                    disabled={savingPassword}
                  >
                    {savingPassword ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            </div>

          </>

        );

      default:

        return null;

    }

  }

  if (!user) {

    return (

      <main className="profile-page">
        <div className="profile-login-prompt">
          <div className="profile-empty-icon">
            <UserRound size={30} />

          </div>

          <h1>Sign in to your account</h1>
          <p>Log in to view your profile and shopping activity.</p>

          <button

            className="profile-primary-button"
            onClick={() => navigate("/login")}

          >
            Sign In <ChevronRight size={17} />
          </button>
        </div>
      </main>

    );

  }

  return (

    <main className="profile-page">
      <div className="profile-page-container">
        <div className="profile-page-heading">
          <span className="profile-eyebrow">YOUR SHOPEZ SPACE</span>
          <h1>My Account</h1>
          <p>Everything you need to manage your shopping experience.</p>

        </div>

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-sidebar-user">
              <div className="profile-avatar profile-avatar-small">

                {profileImage ? (

                  <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-avatar-image"

                  />

                ) : (

                  <UserRound size={25} />

                )}

              </div>

              <div>
                <strong>{user.name || "ShopEZ User"}</strong>
                <span>{user.email}</span>
              </div>
            </div>

            <div className="profile-menu-label">ACCOUNT MENU</div>
            <nav className="profile-menu">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (

                  <button
                    key={item.id}
                    type="button"
                    className={`profile-menu-item ${
                      activeMenu === item.id ? "active" : ""

                    }`}

                    onClick={() => setActiveMenu(item.id)}
                    aria-current={activeMenu === item.id ? "page" : undefined}
                  >

                    <Icon size={19} strokeWidth={1.8} />
                    <span>{item.label}</span>
                    <ChevronRight className="profile-menu-chevron" size={16} />
                  </button>

                );

              })}
            </nav>

            <div className="profile-sidebar-bottom">
              <button
                type="button"
                className="profile-logout-button"
                onClick={handleLogout}

              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
          <section className="profile-main-content">{renderContent()}</section>
        </div>
      </div>
    </main>
  );
}
