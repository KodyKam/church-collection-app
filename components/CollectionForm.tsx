"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { pdf } from "@react-pdf/renderer";
import { CollectionPDF } from "./CollectionPDF";
import toast from "react-hot-toast";

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
  const [success, setSuccess] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleDonationChange = (index: number, field: keyof Donation, value: string | number) => {
  const updated = [...donations];
  updated[index] = {
    ...updated[index],
    [field]: field === "amount" ? Number(value) : value
  } as Donation;
  setDonations(updated);
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    if (!depositSlip) {
      toast.error("Deposit slip is required!");
      return;
    }

    let depositUrl = "";

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("deposit-slips")
      .upload(`slips/${Date.now()}_${depositSlip.name}`, depositSlip);

    if (uploadError) throw uploadError;
    depositUrl = uploadData?.path || "";

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

    if (collectionError) throw collectionError;

    const donationsToInsert = donations.map((d) => ({
      ...d,
      collection_id: collection.id,
    }));

    const { error: donationsError } = await supabase
      .from("donations")
      .insert(donationsToInsert);

    if (donationsError) throw donationsError;

    const pdfBlob = await pdf(
      <CollectionPDF
        collection={collection}
        donations={donations}
        totalAmount={totalAmount}
        depositSlipUrl={depositUrl}
      />
    ).toBlob();

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `collection_${collection.date}.pdf`;
    link.click();

    setSuccess(true);
    setDonations([
      { donor_name: "", check_number: "", amount: 0, donation_type: "Tithes" },
    ]);
    setDepositSlip(null);
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong. Please check console.");
    toast.success("Collection saved successfully!");
  } finally {
    setIsSubmitting(false);
  }
};

  // Export collections for date range
  const handleExportCollections = async () => {
  setIsExporting(true);

  try {
    const { data: collections, error } = await supabase
      .from("collections")
      .select("*, donations(*)")
      .gte("date", exportStart)
      .lte("date", exportEnd);

    if (error) throw error;
    if (!collections) return;

    for (const collection of collections as any[]) {
      const donationsList = collection.donations || [];

      const total = (donationsList as Donation[]).reduce(
        (sum, d) => sum + (Number(d.amount) || 0),
        0
      );

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
  } catch (err) {
    console.error(err);
    alert("Export failed.");
  } finally {
    setIsExporting(false);
  }
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
            <input
  type="file"
  accept="image/*"
  capture="environment"
  onChange={(e) => {
    if (e.target.files?.[0]) {
      setDepositSlip(e.target.files[0]);
    }
  }}
/>
{depositSlip && (
  <img
    src={URL.createObjectURL(depositSlip)}
    alt="Preview"
    className="w-32 mt-2 rounded"
  />
)}
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

      {/* Future work note */}
<div style={{ backgroundColor: "#fff3cd", padding: "0.5rem", borderRadius: "6px", marginBottom: "1rem" }}>
  ⚠️ Submit & Export Collection buttons need improvements. See developer note in code.
</div>
      <button type="submit" disabled={isSubmitting}>
  {isSubmitting ? "Saving..." : "Submit Collection"}
    </button>

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
        <button type="button" onClick={handleExportCollections} disabled={isExporting}>
          {isExporting ? "Exporting..." : "Export Collections PDF"}
        </button>
      </div>
    </form>
  );
}