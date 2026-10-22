import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

type Church = {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
};

type CollectionHistory = {
  id: string;
  date: string;
  service_type: string | null;
  voided_at: string | null;
  void_reason: string | null;
};

type Donation = {
  id: string;
  donor_name: string;
  amount: number;
  donation_type: string;
  created_at: string;
  collection_id: string | null;
  collection: CollectionHistory | null;
};

type Donor = {
  id: string;
  name: string;
};

type Props = {
  donor: Donor;
  donations: Donation[];
  church: Church | null;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingHorizontal: 30,
    paddingBottom: 75,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
  },
  logo: {
    width: 65,
    height: 65,
    objectFit: "contain",
    alignSelf: "center",
    marginBottom: 10,
  },
  churchName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    marginTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  detailLabel: {
    width: 110,
    color: "#6b7280",
  },
  detailValue: {
    flex: 1,
    fontFamily: "Helvetica-Bold",
  },
  summary: {
    flexDirection: "row",
    marginTop: 15,
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 12,
    border: "1 solid #e5e7eb",
    borderRadius: 5,
  },
  summaryLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  table: {
    width: "100%",
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderTop: "1 solid #d1d5db",
    borderBottom: "1 solid #d1d5db",
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  headerText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #e5e7eb",
    paddingVertical: 9,
    paddingHorizontal: 5,
  },
  dateColumn: {
    width: "19%",
  },
  amountColumn: {
    width: "17%",
    textAlign: "right",
    paddingRight: 5,
  },
  typeColumn: {
    width: "24%",
    paddingLeft: 8,
  },
  statusColumn: {
    width: "40%",
    paddingLeft: 8,
  },
  cellText: {
    fontSize: 9,
  },
  voided: {
    color: "#b91c1c",
    fontFamily: "Helvetica-Bold",
  },
  valid: {
    color: "#166534",
    fontFamily: "Helvetica-Bold",
  },
  voidReason: {
    marginTop: 4,
    fontSize: 8,
    color: "#991b1b",
    lineHeight: 1.3,
  },
  notice: {
    backgroundColor: "#fef2f2",
    border: "1 solid #fecaca",
    padding: 9,
    marginBottom: 12,
    borderRadius: 4,
    color: "#991b1b",
    fontSize: 9,
    lineHeight: 1.4,
  },
  emptyMessage: {
    padding: 15,
    textAlign: "center",
    color: "#6b7280",
    borderBottom: "1 solid #e5e7eb",
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 30,
    right: 30,
    borderTop: "1 solid #d1d5db",
    paddingTop: 8,
    textAlign: "center",
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.5,
  },
});

function formatDate(date: string | null | undefined): string {
  if (!date) return "—";

  const parsed = new Date(`${date.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-CA");
}

function money(amount: number): string {
  return `$${(Number(amount) || 0).toFixed(2)}`;
}

export default function DonorHistoryPDF({
  donor,
  donations,
  church,
}: Props) {
  const validDonations = donations.filter(
    (donation) => !donation.collection?.voided_at
  );

  const voidedDonations = donations.filter(
    (donation) => Boolean(donation.collection?.voided_at)
  );

  const totalAmount = validDonations.reduce(
    (sum, donation) => sum + (Number(donation.amount) || 0),
    0
  );

  return (
    <Document
      title={`${donor.name} - Contribution History`}
      author={church?.name || "Tithr"}
      subject="Donor Contribution History"
    >
      <Page size="A4" style={styles.page} wrap>
        {church?.logo_url ? (
          <Image src={church.logo_url} style={styles.logo} />
        ) : null}

        {church?.name ? (
          <Text style={styles.churchName}>{church.name}</Text>
        ) : null}

        <Text style={styles.title}>Donor Contribution History</Text>

        <Text style={styles.subtitle}>
          Report generated {new Date().toLocaleDateString("en-CA")}
        </Text>

        <Text style={styles.sectionTitle}>Donor Information</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Donor Name</Text>
          <Text style={styles.detailValue}>{donor.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Report Period</Text>
          <Text style={styles.detailValue}>All recorded history</Text>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Valid Donations</Text>
            <Text style={styles.summaryValue}>
              {validDonations.length}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Contributed</Text>
            <Text style={styles.summaryValue}>{money(totalAmount)}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Voided Entries</Text>
            <Text style={styles.summaryValue}>
              {voidedDonations.length}
            </Text>
          </View>
        </View>

        {voidedDonations.length > 0 ? (
          <Text style={styles.notice}>
            Voided entries are retained for historical reference and are
            excluded from the valid donation count and total contributed.
          </Text>
        ) : null}

        <Text style={styles.sectionTitle}>Contribution Details</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.headerText, styles.dateColumn]}>
              Date
            </Text>
            <Text style={[styles.headerText, styles.amountColumn]}>
              Amount
            </Text>
            <Text style={[styles.headerText, styles.typeColumn]}>
              Type
            </Text>
            <Text style={[styles.headerText, styles.statusColumn]}>
              Status / Reason
            </Text>
          </View>

          {donations.length === 0 ? (
            <Text style={styles.emptyMessage}>
              No contributions have been recorded for this donor.
            </Text>
          ) : (
            donations.map((donation) => {
              const isVoided = Boolean(donation.collection?.voided_at);

              const date = donation.collection?.date
                ? formatDate(donation.collection.date)
                : formatDate(donation.created_at);

              return (
                <View
                  key={donation.id}
                  style={styles.tableRow}
                  wrap={false}
                >
                  <View style={styles.dateColumn}>
                    <Text style={styles.cellText}>{date}</Text>
                  </View>

                  <View style={styles.amountColumn}>
                    <Text
                      style={[
                        styles.cellText,
                        ...(isVoided ? [styles.voided] : []),
                      ]}
                    >
                      {money(donation.amount)}
                    </Text>
                  </View>

                  <View style={styles.typeColumn}>
                    <Text style={styles.cellText}>
                      {donation.donation_type || "—"}
                    </Text>
                  </View>

                  <View style={styles.statusColumn}>
                    {isVoided ? (
                      <>
                        <Text style={[styles.cellText, styles.voided]}>
                          VOIDED
                        </Text>
                        <Text style={styles.voidReason}>
                          Reason:{" "}
                          {donation.collection?.void_reason ||
                            "No reason recorded"}
                        </Text>
                      </>
                    ) : (
                      <Text style={[styles.cellText, styles.valid]}>
                        Valid
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

                <Text style={styles.footer} fixed>
                  {[church?.name, church?.address, church?.phone]
                    .filter(Boolean)
                    .join(" | ")}
                </Text>
              </Page>
    </Document>
  );
}
