import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface SalaryData {
    name: string;
    month: string;
    baseSalary: number;
    allowance: number;
    overtimeBonus: number;
    advances: number;
    netSalary: number;
    presentDays: number;
}

function inr(n: number) {
    return "Rs. " + n.toLocaleString("en-IN");
}

export function generateSalaryPDF(data: SalaryData) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    // ─── HEADER BAND ──────────────────────────────────────────────────────────
    doc.setFillColor(18, 18, 20);
    doc.rect(0, 0, W, 42, "F");

    // Yellow accent bar
    doc.setFillColor(234, 179, 8);
    doc.rect(0, 42, W, 3, "F");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text("SALARY SLIP", 14, 20);

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(113, 113, 122);
    doc.text("Employee Management System", 14, 30);

    // Month badge (right)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(234, 179, 8);
    doc.text(data.month.toUpperCase(), W - 14, 20, { align: "right" });

    // Generated date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122);
    doc.text(`Issued: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, W - 14, 30, { align: "right" });

    // ─── EMPLOYEE INFO BOX ────────────────────────────────────────────────────
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, 52, W - 28, 28, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(18, 18, 20);
    doc.text(data.name, 22, 63);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(113, 113, 122);
    doc.text(`Attendance: ${data.presentDays} day${data.presentDays !== 1 ? "s" : ""} present`, 22, 72);

    // ─── EARNINGS ─────────────────────────────────────────────────────────────
    const earningsBody: (string | { content: string; styles?: object })[][] = [
        ["Base Salary", { content: inr(data.baseSalary), styles: { halign: "right" as const, fontStyle: "bold" as const } }],
        [`Attendance Allowance (${data.presentDays} days)`, { content: inr(data.allowance), styles: { halign: "right" as const, fontStyle: "bold" as const } }],
    ];
    if (data.overtimeBonus > 0) {
        earningsBody.push(["Overtime Bonus", { content: inr(data.overtimeBonus), styles: { halign: "right" as const, fontStyle: "bold" as const } }]);
    }

    const grossEarnings = data.baseSalary + data.allowance + data.overtimeBonus;
    earningsBody.push([
        { content: "Gross Earnings", styles: { fontStyle: "bold" as const, fillColor: [240, 253, 244] as unknown as string } },
        { content: inr(grossEarnings), styles: { halign: "right" as const, fontStyle: "bold" as const, fillColor: [240, 253, 244] as unknown as string, textColor: [21, 128, 61] as unknown as string } },
    ]);

    autoTable(doc, {
        startY: 88,
        head: [["EARNINGS", ""]],
        body: earningsBody,
        theme: "grid",
        headStyles: {
            fillColor: [22, 163, 74],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
            cellPadding: { top: 5, bottom: 5, left: 6, right: 6 },
        },
        bodyStyles: {
            fontSize: 10,
            textColor: [24, 24, 27],
            cellPadding: { top: 4, bottom: 4, left: 6, right: 6 },
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 48, halign: "right" } },
        margin: { left: 14, right: 14 },
    });

    let afterY = (doc as any).lastAutoTable?.finalY ?? 140;

    // ─── DEDUCTIONS ───────────────────────────────────────────────────────────
    if (data.advances > 0) {
        afterY += 6;
        autoTable(doc, {
            startY: afterY,
            head: [["DEDUCTIONS", ""]],
            body: [
                ["Advance Recovery", { content: `- ${inr(data.advances)}`, styles: { halign: "right" as const, fontStyle: "bold" as const, textColor: [220, 38, 38] as unknown as string } }],
            ],
            theme: "grid",
            headStyles: {
                fillColor: [220, 38, 38],
                textColor: [255, 255, 255],
                fontStyle: "bold",
                fontSize: 9,
                cellPadding: { top: 5, bottom: 5, left: 6, right: 6 },
            },
            bodyStyles: {
                fontSize: 10,
                textColor: [24, 24, 27],
                cellPadding: { top: 4, bottom: 4, left: 6, right: 6 },
                fillColor: [254, 242, 242],
            },
            columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 48, halign: "right" } },
            margin: { left: 14, right: 14 },
        });
        afterY = (doc as any).lastAutoTable?.finalY ?? afterY;
    }

    // ─── NET SALARY BOX ───────────────────────────────────────────────────────
    afterY += 10;
    doc.setFillColor(18, 18, 20);
    doc.roundedRect(14, afterY, W - 28, 24, 3, 3, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(161, 161, 170);
    doc.text("NET SALARY", 22, afterY + 10);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(234, 179, 8);
    doc.text(data.month, 22, afterY + 18);

    doc.setFontSize(18);
    doc.text(inr(data.netSalary), W - 22, afterY + 16, { align: "right" });

    // ─── SIGNATURE ────────────────────────────────────────────────────────────
    const sigY = afterY + 50;
    if (sigY < H - 30) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(14, sigY, 80, sigY);
        doc.line(W - 80, sigY, W - 14, sigY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 160);
        doc.text("Employee Signature", 14, sigY + 5);
        doc.text("Authorized Signature", W - 14, sigY + 5, { align: "right" });
    }

    // ─── FOOTER ───────────────────────────────────────────────────────────────
    doc.setFillColor(245, 245, 245);
    doc.rect(0, H - 14, W, 14, "F");

    doc.setFillColor(234, 179, 8);
    doc.rect(0, H - 14, W, 1, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a system-generated document and does not require a physical signature.", W / 2, H - 5, { align: "center" });

    doc.save(`salary-slip-${data.name.replace(/\s+/g, "-")}-${data.month}.pdf`);
}
