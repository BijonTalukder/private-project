import { Modal, Button, Descriptions, Table, Tag, Space, Divider } from "antd";
import { FileTextOutlined, PrinterOutlined, DownloadOutlined, TruckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { DeliveryChallan } from "../../api/services/delivery-challan/deliverychallanaApi";
import type { ColumnsType } from "antd/es/table";
import { message } from "antd";

interface DeliveryChallanViewModalProps {
    challan: DeliveryChallan | null;
    open: boolean;
    onClose: () => void;
}

const DeliveryChallanViewModal = ({ challan, open, onClose }: DeliveryChallanViewModalProps) => {
    if (!challan) return null;
    console.log(challan, "challan")
    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            message.error("Please allow popups to print");
            return;
        }

        const itemsHtml = challan.items
            .map(
                (item, idx) => `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${idx + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.invoiceQty}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: #f5222d;">${item.previousDeliveryQty}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold; color: #52c41a;">${item.deliveryQty}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: #667eea;">${item.remainingQty}</td>
            </tr>
        `
            )
            .join("");

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Delivery Challan - ${challan.challanNo}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Arial', sans-serif; padding: 40px; color: #2d3748; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 20px; }
                    .header h1 { color: #667eea; font-size: 32px; margin-bottom: 5px; }
                    .header .challan-badge { 
                        display: inline-block; 
                        background: #52c41a; 
                        color: white; 
                        padding: 5px 15px; 
                        border-radius: 20px; 
                        font-size: 14px; 
                        margin-top: 10px;
                    }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                    .info-section { background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
                    .info-section h3 { color: #667eea; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; }
                    .info-row { margin: 8px 0; font-size: 14px; }
                    .info-row strong { display: inline-block; min-width: 140px; color: #4a5568; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th { background: #667eea; color: white; padding: 12px; text-align: left; font-size: 13px; }
                    td { border: 1px solid #e2e8f0; padding: 10px; font-size: 13px; }
                    tbody tr:nth-child(even) { background: #f7fafc; }
                    .totals { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 8px; margin-top: 30px; }
                    .totals-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; text-align: center; }
                    .total-item { padding: 15px; }
                    .total-label { font-size: 12px; opacity: 0.9; margin-bottom: 8px; text-transform: uppercase; }
                    .total-value { font-size: 28px; font-weight: bold; }
                    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #718096; font-size: 12px; }
                    .remarks { background: #fffbeb; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0; }
                    .remarks h4 { color: #f59e0b; margin-bottom: 8px; }
                    @media print { 
                        body { padding: 20px; }
                        .header h1 { font-size: 28px; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>DELIVERY CHALLAN</h1>
                    <div class="challan-badge">✓ DELIVERY</div>
                </div>
                
                <div class="info-grid">
                    <div class="info-section">
                        <h3>Challan Information</h3>
                        <div class="info-row"><strong>Challan No:</strong> ${challan.challanNo}</div>
                        <div class="info-row"><strong>Challan ID:</strong> ${challan.challanId}</div>
                        <div class="info-row"><strong>Date:</strong> ${dayjs(challan.challanDate).format("DD MMMM YYYY")}</div>
                        <div class="info-row"><strong>Status:</strong> ${challan.isActive ? "Active" : "Inactive"}</div>
                    </div>
                    
                    <div class="info-section">
                        <h3>Invoice & Client Details</h3>
                        <div class="info-row"><strong>Invoice No:</strong> ${challan.invoice.invoiceNo}</div>
                        <div class="info-row"><strong>Invoice ID:</strong> ${challan.invoice.invoiceId}</div>
                        <div class="info-row"><strong>Client Name:</strong> ${challan.client.name}</div>
                        <div class="info-row"><strong>Client Contact:</strong> ${challan.client.contactNo || "—"}</div>
                    </div>
                </div>

                ${challan.remarks
                ? `
                <div class="remarks">
                    <h4>📝 Remarks</h4>
                    <p>${challan.remarks}</p>
                </div>
                `
                : ""
            }

                <h2 style="color: #667eea; margin: 30px 0 15px; font-size: 18px;">Delivery Items</h2>
                <table>
                    <thead>
                        <tr>
                            <th style="text-align: center; width: 40px;">#</th>
                            <th style="text-align: right;">Invoice Qty</th>
                            <th style="text-align: right;">Previous Delivery</th>
                            <th style="text-align: right;">Delivery Qty</th>
                            <th style="text-align: right;">Remaining</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="totals-grid">
                        <div class="total-item">
                            <div class="total-label">Total Items</div>
                            <div class="total-value">${challan.items.length}</div>
                        </div>
                        <div class="total-item">
                            <div class="total-label">Total Delivery Quantity</div>
                            <div class="total-value">${challan.totalDeliveryQty}</div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p>This is a delivery challan. Generated on ${dayjs().format("DD MMMM YYYY, hh:mm A")}</p>
                  
                </div>
            </body>
            </html>
        `);
        // <p style="margin-top: 5px;">Powered by Your Company Name</p>
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    const handleDownload = () => {
        // Create HTML content
        const content = document.createElement("div");
        content.innerHTML = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1 style="color: #667eea; text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 10px;">
                    DELIVERY CHALLAN
                </h1>
                
                <div style="margin: 20px 0;">
                    <h3>Challan Information</h3>
                    <p><strong>Challan No:</strong> ${challan.challanNo}</p>
                    <p><strong>Challan ID:</strong> ${challan.challanId}</p>
                    <p><strong>Date:</strong> ${dayjs(challan.challanDate).format("DD MMMM YYYY")}</p>
                </div>
                
                <div style="margin: 20px 0;">
                    <h3>Invoice & Client Details</h3>
                    <p><strong>Invoice No:</strong> ${challan.invoice.invoiceNo}</p>
                    <p><strong>Client:</strong> ${challan.client.name}</p>
                </div>
                
                <div style="margin: 20px 0;">
                    <h3>Delivery Items</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #667eea; color: white;">
                                <th style="border: 1px solid #ddd; padding: 8px;">#</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Invoice Qty</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Previous</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Delivery</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Remaining</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${challan.items
                .map(
                    (item, idx) => `
                                <tr>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${idx + 1}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${item.invoiceQty}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${item.previousDeliveryQty}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${item.deliveryQty}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${item.remainingQty}</td>
                                </tr>
                            `
                )
                .join("")}
                        </tbody>
                    </table>
                </div>
                
                <p style="margin-top: 20px;"><strong>Total Delivery Quantity: ${challan.totalDeliveryQty}</strong></p>
            </div>
        `;

        // Create blob and download
        const blob = new Blob([content.innerHTML], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Delivery_Challan_${challan.challanNo}_${dayjs().format("YYYYMMDD")}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        message.success("Challan downloaded successfully!");
    };

    const itemColumns: ColumnsType<any> = [
        {
            title: "#",
            key: "index",
            width: 50,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "Invoice Qty",
            dataIndex: "invoiceQty",
            align: "right",
            render: (qty: number) => <span style={{ fontFamily: "monospace", fontWeight: "500" }}>{qty}</span>,
        },
        {
            title: "Previous Delivery",
            dataIndex: "previousDeliveryQty",
            align: "right",
            render: (qty: number) => (
                <span style={{ fontFamily: "monospace", color: "#f5222d", fontWeight: "500" }}>{qty}</span>
            ),
        },
        {
            title: "Delivery Qty",
            dataIndex: "deliveryQty",
            align: "right",
            render: (qty: number) => (
                <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#52c41a", fontSize: "14px" }}>
                    {qty}
                </span>
            ),
        },
        {
            title: "Remaining",
            dataIndex: "remainingQty",
            align: "right",
            render: (qty: number) => (
                <span style={{ fontFamily: "monospace", color: "#667eea", fontWeight: "500" }}>{qty}</span>
            ),
        },
    ];

    return (
        <Modal
            title={
                <div style={{ fontSize: "18px", fontWeight: "600", color: "#2D3748", padding: "10px 0" }}>
                    <TruckOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                    Delivery Challan — {challan.challanNo}
                </div>
            }
            open={open}
            onCancel={onClose}
            width={1000}
            style={{ top: 30 }}
            footer={
                <Space>
                    <Button onClick={onClose}>Close</Button>
                    {/* <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                        Download
                    </Button> */}
                    <Button
                        type="primary"
                        icon={<PrinterOutlined />}
                        onClick={handlePrint}
                        style={{
                            background: "linear-gradient(to right, #667eea, #764ba2)",
                            border: "none",
                        }}
                    >
                        Print
                    </Button>
                </Space>
            }
        >
            {/* Header Info */}
            <div
                style={{
                    background: "#F7FAFC",
                    padding: "20px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                }}
            >
                <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Challan ID">
                        <Tag color="purple" style={{ fontFamily: "monospace" }}>
                            {challan.challanId}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Challan No">
                        <strong>{challan.challanNo}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Challan Date">
                        {dayjs(challan.challanDate).format("DD MMM YYYY")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={challan.isActive ? "success" : "default"}>
                            {challan.isActive ? "Active" : "Inactive"}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
            </div>

            {/* Invoice & Client Info */}
            <div
                style={{
                    background: "#F7FAFC",
                    padding: "20px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                }}
            >
                <h4 style={{ margin: "0 0 15px", fontSize: "14px", fontWeight: "600", color: "#2D3748" }}>
                    Invoice & Client Information
                </h4>
                <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Invoice No">
                        <Space>
                            <FileTextOutlined style={{ color: "#667eea" }} />
                            {challan.invoice.invoiceNo}
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Invoice ID">
                        <Tag color="blue">{challan.invoice.invoiceId}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Client Name">{challan.client.name}</Descriptions.Item>
                    <Descriptions.Item label="Client Contact">
                        {challan.client.contactNo || "—"}
                    </Descriptions.Item>
                </Descriptions>
            </div>

            {/* Remarks */}
            {challan.remarks && (
                <div
                    style={{
                        background: "#FFFBEB",
                        padding: "15px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                        border: "1px solid #FEF3C7",
                    }}
                >
                    <h4 style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: "600", color: "#F59E0B" }}>
                        📝 Remarks
                    </h4>
                    <p style={{ margin: 0, color: "#92400E" }}>{challan.remarks}</p>
                </div>
            )}

            <Divider orientation="horizontal" style={{ fontWeight: "600", color: "#2D3748" }}>
                Delivery Items ({challan.items.length})
            </Divider>

            {/* Items Table */}
            <Table
                columns={itemColumns}
                dataSource={challan.items}
                rowKey="_id"
                pagination={false}
                size="small"
                style={{ marginBottom: "20px" }}
            />

            {/* Totals */}
            <div
                style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    padding: "20px",
                    borderRadius: "8px",
                }}
            >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
                    <div>
                        <div style={{ fontSize: "12px", color: "#E0E7FF", marginBottom: "5px" }}>Total Items</div>
                        <div
                            style={{
                                fontSize: "24px",
                                fontWeight: "700",
                                color: "#fff",
                                fontFamily: "monospace",
                            }}
                        >
                            {challan.items.length}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "12px", color: "#E0E7FF", marginBottom: "5px" }}>
                            Total Delivery Quantity
                        </div>
                        <div
                            style={{
                                fontSize: "28px",
                                fontWeight: "700",
                                color: "#fff",
                                fontFamily: "monospace",
                            }}
                        >
                            {challan.totalDeliveryQty}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default DeliveryChallanViewModal;