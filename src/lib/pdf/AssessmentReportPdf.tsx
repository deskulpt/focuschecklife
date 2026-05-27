import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { AssessmentData } from '@/components/AssessmentApp';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica', color: '#1a1a1a' },
  header: { borderBottomWidth: 2, borderBottomColor: '#3B82F6', paddingBottom: 12, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#6b7280' },
  section: { marginBottom: 16 },
  h2: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  label: { color: '#6b7280' },
  value: { fontWeight: 'bold' },
  badge: { padding: 4, borderRadius: 4, fontSize: 9, textAlign: 'center' },
  paragraph: { lineHeight: 1.5, marginBottom: 8 },
  footer: { position: 'absolute', bottom: 24, left: 40, right: 40, fontSize: 8, color: '#9ca3af', textAlign: 'center' },
  disclaimer: { backgroundColor: '#fef3c7', padding: 10, borderRadius: 4, marginTop: 8, fontSize: 9, color: '#78350f' },
});

interface Props {
  data: AssessmentData;
  userName?: string;
  aiInterpretation?: string | null;
  completedAt?: string;
}

export const AssessmentReportPdf = ({ data, userName, aiInterpretation, completedAt }: Props) => {
  const categories = ['inattention', 'hyperactivity', 'impulsivity', 'functional_impairment'];
  const overallRisk = (data as { riskLevel?: string }).riskLevel || 'moderate';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>FocusCheck Assessment Report</Text>
          <Text style={styles.subtitle}>
            {userName ? `Prepared for ${userName} · ` : ''}
            {completedAt ? new Date(completedAt).toLocaleDateString() : new Date().toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Overview</Text>
          <View style={styles.row}><Text style={styles.label}>Test type</Text><Text style={styles.value}>ADHD Screener</Text></View>
          <View style={styles.row}><Text style={styles.label}>Age group</Text><Text style={styles.value}>{data.ageGroup}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Overall risk level</Text><Text style={styles.value}>{overallRisk.toUpperCase()}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Symptom Profile</Text>
          {categories.map((c) => (
            <View key={c} style={styles.row}>
              <Text style={styles.label}>{c.replace('_', ' ')}</Text>
              <Text style={styles.value}>See dashboard for full breakdown</Text>
            </View>
          ))}
        </View>

        {aiInterpretation && (
          <View style={styles.section}>
            <Text style={styles.h2}>Personal interpretation</Text>
            <Text style={styles.paragraph}>{aiInterpretation}</Text>
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text>
            This report is an educational screener and is not a medical diagnosis. Clinical trials are pending.
            Please consult a qualified healthcare professional for diagnosis or treatment decisions.
          </Text>
        </View>

        <Text style={styles.footer} fixed>
          FocusCheck · Generated {new Date().toLocaleString()} · Confidential
        </Text>
      </Page>
    </Document>
  );
};
