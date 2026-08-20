import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#2B2420",
  },
  header: {
    borderBottom: 2,
    borderBottomColor: "#3D2B1F",
    paddingBottom: 12,
    marginBottom: 16,
  },
  schoolName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#3D2B1F",
  },
  documentTitle: {
    fontSize: 11,
    color: "#6B6055",
    marginTop: 2,
  },
  identityBlock: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: "#EDE4D9",
    borderRadius: 4,
  },
  identityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  identityLabel: {
    color: "#6B6055",
  },
  identityValue: {
    fontFamily: "Helvetica-Bold",
    color: "#2B2420",
  },
  table: {
    marginTop: 8,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#3D2B1F",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: 1,
    borderBottomColor: "#E4DDD1",
  },
  colSubject: { width: "50%" },
  colCoef: { width: "20%", textAlign: "center" },
  colAverage: { width: "30%", textAlign: "right" },
  overallBlock: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#EDE4D9",
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  overallLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#3D2B1F",
  },
  overallValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#3D2B1F",
  },
  rankText: {
    fontSize: 9,
    color: "#6B6055",
    marginTop: 2,
  },
  signatureBlock: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "40%",
    borderTop: 1,
    borderTopColor: "#2B2420",
    paddingTop: 4,
    textAlign: "center",
    fontSize: 9,
    color: "#6B6055",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#6B6055",
    borderTop: 1,
    borderTopColor: "#E4DDD1",
    paddingTop: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerCustomText: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 7,
  },
});

type BulletinDocumentProps = {
  schoolName: string;
  studentName: string;
  matricule: string;
  className: string;
  academicYearLabel: string;
  subjects: { name: string; average: number; coefficientSum: number }[];
  overallAverage: number | null;
  generatedAt: Date;
  showRank?: boolean;
  rank?: number | null;
  classSize?: number | null;
  showSignatures?: boolean;
  footerText?: string | null;
};

export function BulletinDocument({
  schoolName,
  studentName,
  matricule,
  className,
  academicYearLabel,
  subjects,
  overallAverage,
  generatedAt,
  showRank,
  rank,
  classSize,
  showSignatures,
  footerText,
}: BulletinDocumentProps) {
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(generatedAt);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.schoolName}>{schoolName}</Text>
          <Text style={styles.documentTitle}>Bulletin scolaire - {academicYearLabel}</Text>
        </View>

        <View style={styles.identityBlock}>
          <View style={styles.identityRow}>
            <Text style={styles.identityLabel}>Eleve</Text>
            <Text style={styles.identityValue}>{studentName}</Text>
          </View>
          <View style={styles.identityRow}>
            <Text style={styles.identityLabel}>Matricule</Text>
            <Text style={styles.identityValue}>{matricule}</Text>
          </View>
          <View style={styles.identityRow}>
            <Text style={styles.identityLabel}>Classe</Text>
            <Text style={styles.identityValue}>{className}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.colSubject]}>Matiere</Text>
            <Text style={[styles.tableHeaderCell, styles.colCoef]}>Coefficient</Text>
            <Text style={[styles.tableHeaderCell, styles.colAverage]}>Moyenne / 20</Text>
          </View>
          {subjects.map((s, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colSubject}>{s.name}</Text>
              <Text style={styles.colCoef}>{s.coefficientSum}</Text>
              <Text style={styles.colAverage}>{s.average.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.overallBlock}>
          <View>
            <Text style={styles.overallLabel}>Moyenne generale</Text>
            {showRank && rank && classSize ? (
              <Text style={styles.rankText}>Rang : {rank} / {classSize}</Text>
            ) : null}
          </View>
          <Text style={styles.overallValue}>
            {overallAverage !== null ? overallAverage.toFixed(2) : "-"} / 20
          </Text>
        </View>

        {showSignatures ? (
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureBox}>Signature du directeur</Text>
            <Text style={styles.signatureBox}>Signature du parent</Text>
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <View style={styles.footerRow}>
            <Text>BAOBAB ECOLE - Document genere automatiquement</Text>
            <Text>{formattedDate}</Text>
          </View>
          {footerText ? <Text style={styles.footerCustomText}>{footerText}</Text> : null}
        </View>
      </Page>
    </Document>
  );
}