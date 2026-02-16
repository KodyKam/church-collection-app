"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { pdf } from "@react-pdf/renderer";
import { CollectionPDF } from "./CollectionPDF";

type Donation = {
  donor_name: string;
  check_number: string;
  amount: number;
  donation_type: string;
};

export default function CollectionForm() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [serviceType, setServiceType] = useState("Sabbath Class");
  const [recordedBy, setRecordedBy] = useState("");
  const [countedBy, setCountedBy] = useState("");
  const [donations, setDonations] = useState<Donation[]>([
    { donor_name: "", check_number: "", amount: 0, donation_type: "Tithes" },
  ]);
  const [depositSlip, setDepositSlip] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Export collections state
  const [exportStart, setExportStart] = useState(new Date().toISOString().slice(0, 10));
  const [exportEnd, setExportEnd] = useState(new Date().toISOString().slice(0, 10));

  const donationTypes = ["Tithes", "Freewill", "Feast", "Audio", "Other"];
  const serviceTypes = [
    "Sabbath Class",
    "Passover",
    "Feast of Unleavened Bread Day 1",
    "Feast of Unleavened Bread Day 7",
    "Pentecost",
    "Memorial of Blowing of Trumpets",
    "Day of Atonement",
    "Feast of Tabernacles",
    "8th Day Feast",
  ];

  const totalAmount = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const addDonationRow = () => {
    setDonations([...donations, { donor_name: "", check_number: "", amount: 0, donation_type: "Tithes" }]);
  };

  const handleDonationChange = (index: number, field: keyof Donation, value: any) => {
    const updated = [...donations];
    updated[index][field] = field === "amount" ? Number(value) : value;
    setDonations(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!depositSlip) {
      alert("Deposit slip is required!");
      setLoading(false);
      return;
    }

    // 1️⃣ Upload deposit slip
    let depositUrl = "";
    if (depositSlip) {
      const { data, error } = await supabase.storage
        .from("deposit-slips")
        .upload(`slips/${Date.now()}_${depositSlip.name}`, depositSlip);
      if (error) console.error(error);
      else depositUrl = data?.path || "";
    }

    // 2️⃣ Insert collection
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .insert([
        {
          date,
          service_type: serviceType,
          recorded_by: recordedBy,
          counted_by: countedBy,
          deposit_slip_url: depositUrl,
        },
      ])
      .select()
      .single();

    if (collectionError) {
      console.error(collectionError);
      setLoading(false);
      return;
    }

    // 3️⃣ Insert donations
    const donationsToInsert = donations.map((d) => ({ ...d, collection_id: collection.id }));
    const { error: donationsError } = await supabase.from("donations").insert(donationsToInsert);
    if (donationsError) {
      console.error(donationsError);
      setLoading(false);
      return;
    }

    // 4️⃣ Generate PDF for this collection
    const pdfBlob = await pdf(
      <CollectionPDF
        collection={collection}
        donations={donations}
        totalAmount={totalAmount}
        depositSlipUrl={depositUrl}
      />
    ).toBlob();

    // 5️⃣ Download PDF labeled by collection date
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `collection_${collection.date}.pdf`;
    link.click();

    // 6️⃣ Reset form
    setSuccess(true);
    setLoading(false);
    setDonations([{ donor_name: "", check_number: "", amount: 0, donation_type: "Tithes" }]);
    setDepositSlip(null);
  };

  // Export collections for date range
  const handleExportCollections = async () => {
    setLoading(true);

    const { data: collections, error } = await supabase
      .from("collections")
      .select("*, donations(*)")
      .gte("date", exportStart)
      .lte("date", exportEnd)
      .order("date", { ascending: true });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    for (const collection of collections) {
      const donationsList = collection.donations || [];
      const total = donationsList.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);

      const pdfBlob = await pdf(
        <CollectionPDF
          collection={collection}
          donations={donationsList}
          totalAmount={total}
          depositSlipUrl={collection.deposit_slip_url}
        />
      ).toBlob();

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `collection_${collection.date}.pdf`;
      link.click();
    }

    setLoading(false);
  };

  return (
    <form className="collection-form" onSubmit={handleSubmit}>
      <h1>Weekly Collection Entry</h1>

      <div className="form-group">
        <div className="form-row">
          <label>
            Date:
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>

          <label>
            Service Type:
            <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} required>
              {serviceTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>

        <div className="form-row">
          <label>
            Recorded By:
            <input type="text" placeholder="Initials or Name" value={recordedBy} onChange={(e) => setRecordedBy(e.target.value)} required />
          </label>

          <label>
            Counted By:
            <input type="text" placeholder="Initials or Name" value={countedBy} onChange={(e) => setCountedBy(e.target.value)} required />
          </label>
        </div>

        <div className="form-row">
          <label>
            Deposit Slip (required):
            <input type="file" accept="image/*,.pdf" onChange={(e) => setDepositSlip(e.target.files?.[0] || null)} required />
          </label>
        </div>
      </div>

      <h2>Offerings</h2>
      {donations.map((d, i) => (
        <div key={i} className="donation-row">
          <input type="text" placeholder="Donor Name" value={d.donor_name} onChange={(e) => handleDonationChange(i, "donor_name", e.target.value)} required />
          <input type="text" placeholder="Check #" value={d.check_number} onChange={(e) => handleDonationChange(i, "check_number", e.target.value)} />
          <input type="number" placeholder="Amount" value={d.amount} onChange={(e) => handleDonationChange(i, "amount", e.target.value)} required />
          <select value={d.donation_type} onChange={(e) => handleDonationChange(i, "donation_type", e.target.value)} required>
            {donationTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      ))}

      <button type="button" onClick={addDonationRow} className="btn-add">Add Another Offering</button>
      
      <div className="total-row">
        <strong>Total: </strong>${totalAmount.toFixed(2)}
      </div>

      {/* ===========================================
  NOTE: ⚠️
  The "Submit Collection" button currently:
    • Sends data to Supabase
    • Generates a PDF
    • Resets the form

  Future improvements needed:
    • Validate deposit slip presence more strictly
    • Handle errors and display user-friendly messages
    • Consider sending email directly with PDF & deposit slip
    • Avoid bucket upload if file size limits are a concern
    • Optionally add confirmation before clearing form
=========================================== */}

      {/* Future work note */}
<div style={{ backgroundColor: "#fff3cd", padding: "0.5rem", borderRadius: "6px", marginBottom: "1rem" }}>
  ⚠️ Submit & Export Collection buttons need improvements. See developer note in code.
</div>
      <button type="submit" disabled={loading} className="btn-submit">{loading ? "Saving..." : "Submit Collection"}</button>

      {success && <p className="success-msg">Collection saved successfully!</p>}

      {/* Export collections section */}
      <div className="export-section">
        <h2>Export Collections</h2>
        <div className="form-row">
          <label>
            From:
            <input type="date" value={exportStart} onChange={(e) => setExportStart(e.target.value)} />
          </label>
          <label>
            To:
            <input type="date" value={exportEnd} onChange={(e) => setExportEnd(e.target.value)} />
          </label>
        </div>
        <button type="button" onClick={handleExportCollections} disabled={loading}>
          {loading ? "Exporting..." : "Export Collections PDF"}
        </button>
      </div>
    </form>
  );
}