import { BsFillHddStackFill } from "react-icons/bs";
import { ImCart } from "react-icons/im";
import { MdAccountBox, MdDashboard, MdQueryStats } from "react-icons/md";
import {
  IoBookSharp,
  IoFileTrayStacked,
  IoJournalSharp,
} from "react-icons/io5";

import {
  StarFilled,
  StarOutlined,
  MenuOutlined,
  UserOutlined,
  CalculatorFilled,
  FormOutlined,
  AlignRightOutlined,
  CustomerServiceOutlined,
  UnorderedListOutlined,
  DeploymentUnitOutlined,
  DeliveredProcedureOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  ContainerOutlined,
} from "@ant-design/icons";
import { RiBillFill } from "react-icons/ri";
import { BiMoney, BiTransfer } from "react-icons/bi";
import { FaWarehouse } from "react-icons/fa";
import { TbReportAnalytics } from "react-icons/tb";
import { SiPaytm } from "react-icons/si";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScaleBalanced } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import routeConstants from "../Routes/routeConstants";
export const items = (user) => [
  // getItem(
  //   "Favorites",
  //   "G",
  //   user?.favPages?.length > 0 ? <StarFilled /> : <StarOutlined />,
  //   user?.favPages?.map((fav, index) =>
  //     getItem(<Link to={fav.url}>{fav.page_name}</Link>, `A${index + 1}`)
  //   )
  // ),
    getItem("Dashboard", "A",  <Link to="/"><MdDashboard  /></Link>,
  //    [
  //   getItem(
  //     <Link to="/dashboard/sku_costing">SKU Costing</Link>,
  //     "2"
  //     // <AiOutlineMinus />
  //   ),
  // ]
),
  getItem("Finance", "D", <BiMoney />, [
    getItem(
      <Link to="/tally/chart-accounts">Account</Link>,
      "D1",
      <MdAccountBox />
    ),
    getItem("Taxation", "D2", <IoBookSharp />, [
      getItem(
        <Link to="/tally/nature-tds">TDS Config</Link>,
        "D21"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/tally/nature-tcs">TCS Config</Link>,
        "D22"
        // <AiOutlineMinus />
      ),
    ]),
    // getItem("TDS", "D2", <IoBookSharp />, [
    //   getItem(
    //     <Link to="/tally/nature-tds">TDS Config</Link>,
    //     "D21"
    //     // <AiOutlineMinus />
    //   ),
    // ]),
    // getItem("TCS", "D22", <IoBookSharp />, []),
    getItem("Vendor Bills", "D3", <RiBillFill />, [
      getItem(
        <Link to="/tally/vendor-bill-posting/vb-1">Vendor Bill Posting</Link>,
        "D31"

        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/tally/vendor-bill-posting/vendor-bill-records">
          VBT Records
        </Link>,
        "D32"

        // <AiOutlineMinus />
      ),
    ]),

    getItem("Accounting Voucher", "D4", <IoJournalSharp />, [
      getItem(
        <Link to="/tally/journal-posting">Journal</Link>,
        "D41"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/tally/contra/1">Contra Transactions</Link>,
        "D42"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/tally/vouchers/bank-payment">Bank Payments</Link>,
        "D43"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/tally/vouchers/bank-receipts">Bank Receipts</Link>,
        "D44"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/tally/vouchers/cash-payment">Cash Payments</Link>,
        "D45"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/tally/vouchers/cash-receipt">Cash Receipts</Link>,
        "D46"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/tally/vouchers/reference/setup">App Reference Setup</Link>,
        "D47"
        // <AiOutlineMinus />
      ),
    ]),
    // getItem(
    //   <Link to="tally/clients/add">Clients</Link>,
    //   "clients/add"
    //   // <AiOutlineMinus />
    // ),
    // getItem("Clients", "clients", <UsergroupAddOutlined />, [
    //   getItem(
    //     <Link to="/tally/clients/add">Add</Link>,
    //     "clients/add"
    //     // <AiOutlineMinus />
    //   ),
    //   getItem(
    //     <Link to="/tally/clients/view">View</Link>,
    //     "clients/view"
    //     // <AiOutlineMinus />
    //   ),
    // ]),
    getItem("Report", "report", <AlignRightOutlined />, [
      getItem(
        <Link to="/tally/ledger-report">Ledger Report</Link>,
        "D12"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/tally/reports/trial-balance-report">
          Trial Balance Report
        </Link>,
        "reports/trial-balance"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/tally/reports/balance-sheet">Balance Sheet</Link>,
        "reports/balance-sheet"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/tally/reports/profitloss-report">P & L Report</Link>,
        "reports/profitloss-report"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/tally/reports/day-book">Day Book</Link>,
        "reports/day-book"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/tally/vouchers/reference/payable-report">Ageing Report</Link>,
        "reports/ageing-report"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/tally/vouchers/reference/tds-report">TDS Report</Link>,
        "reports/tdsReport"
        // <AiOutlineMinus
      ),
      getItem(
        <Link to="/tally/vouchers/reference/mis-report">MIS Report</Link>,
        "reports/misReport"
        // <AiOutlineMinus />)
      ),
      getItem(
        <Link to="/tally/vouchers/reference/gst/report">GSTR1</Link>,
        "/gst/gstReport1"
      ),
    ]),
    getItem("Others", "D9", <IoJournalSharp />, [
      getItem(
        <Link to={routeConstants.finance.vendor.reco.create}>
          Vendor Reconciliation
        </Link>
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/tally/debit-note/create">Debit Note</Link>,
        "/tally/debit-note/create"
        // <AiOutlineMinus />
      ),
      getItem("GST RECO", "D8", <IoJournalSharp />, [
        getItem(<Link to="/add-book-details">Add Book Details</Link>, "D81"),
        getItem(<Link to="/add-gst-details">Add Gst Details</Link>, "D82"),
        getItem(<Link to="/view-reconciled">Reconciled Details</Link>, "D83"),
        getItem(<Link to="/view-summary">Summary</Link>, "D84"),
        getItem(<Link to="/view-book-data">View Book Data</Link>, "D85"),
        getItem(<Link to="/view-gst-data">View Gst Data</Link>, "D86"),
      ]),
    ]),
  ]),

  getItem("Material Management", "B", <BiTransfer />, [
    getItem("Master", "B1", <BsFillHddStackFill />, [
      getItem(
        <Link to="/uom">UoM</Link>,
        "Material Management/B11"
        // <AiOutlineMinus />
      ),
      getItem("Component", "B12", <MdDashboard />, [
        getItem(
          <Link to="/material">Material</Link>,
          "Component/B121"
          //   // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/services">Services</Link>,
          "Component/B122"
          // <AiOutlineMinus />
        ),
      ]),
      getItem(
        <Link to="/masters/products/fg">Products</Link>,
        "Component/B13"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/hsn-map">HSN Map</Link>,
        "hsn-map/B14"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/location">Location</Link>,
        "B114"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/group">Groups</Link>,
        "B15"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/billing-address">Billing Address</Link>,
        "B16"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/shipping-address">Shipping Address</Link>,
        "B17"
        // <AiOutlineMinus />
      ),
      // getItem(
      //   <Link to="/doc_numbering">Doc(s) Number</Link>,
      //   "B17"
      //   // <AiOutlineMinus />
      // ),
      getItem("Bill Of Material", "B18", <MdDashboard />, [
        getItem(
          <Link to="/master/bom/create-bom">Create BOM</Link>,
          "B181"
          // <MdDashboard />
        ),
      ]),
      getItem("Vendor / Supplier", "B19", <MdDashboard />, [
        getItem(
          <Link to="/vendor">Add / Rectify</Link>,
          "B191"
          // <MdDashboard />
        ),
      ]),
      getItem(
        <Link to="tally/clients/add">Clients</Link>,
        "clients/add"
        // <AiOutlineMinus />
      ),
      // getItem("WorkOrder", "B28", <MdDashboard />, [
      //   getItem(
      //     <Link to="/addClient">Create Client</Link>,
      //     "B281"
      //     // <MdDashboard />
      //   ),
      // ]),
      getItem(
        <Link to="/master/reports/projects">Projects</Link>,
        "/master/reports/projects/B20"
        // <MdDashboard />
      ),
      getItem(
        <Link to="/master/reports/r19">Reports</Link>,
        "B21"
        // <MdDashboard />
      ),
    ]),
    getItem("Procurement", "B2", <ImCart />, [
      getItem(
        <Link to="/procurement/create">Create PR</Link>,
        "B23"
        // <AiOutlineMinus />
      ),
       getItem(
        <Link to="/procurement/request">Requested PR</Link>,
        "B22"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/procurement/manage">Manage</Link>,
        "B23"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/procurement/completed">Completed</Link>,
        "B24"
        // <AiOutlineMinus />
      ),
      // getItem(
      //   <Link to="/vendor-pricing">Vendor Pricing</Link>,
      //   "B25"
      //   // <AiOutlineMinus />
      // ),
      getItem(
        <Link to="/procurement/approval">Approval</Link>,
        "B26"
        // <AiOutlineMinus />
      ),
    ]),
    getItem("Warehouse", "B3", <FaWarehouse />, [
      getItem(
        <Link to="/transaction/approved-transaction">MR Approval</Link>,
        "B31"
        // <AiOutlineMinus />
      ),
      getItem(<Link to="/warehouse/material-in">RM MATLS IN</Link>, "B32"),
      ///
      getItem(
        <Link to="/warehouse/prod-return-MIN">Prod. Return MIN</Link>,
        "B33"
        // <AiOutlineMinus />
      ),
        // getItem(
        //   <Link to="/rm/update">Edit MIN</Link>,
        //   "warehouse/minedit/edit"
        //   // <AiOutlineMinus />
        // ),

      getItem("FG (s) Inwarding", "B43", <MdDashboard />, [
        getItem(
          <Link to="/warehouse/fg/pending">Pending FG (s)</Link>,
          "B431"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/warehouse/fg/complete">Completed FG (s)</Link>,
          "B432"
          // <AiOutlineMinus />
        ),
      ]),
      getItem("FG(s) Out", "B35", <MdDashboard />, [
        getItem(
          <Link to="/warehouse/fg-out/create">Create FG Out</Link>,
          "B351"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/warehouse/fg-out/view">View FG Out</Link>,
          "B352"
          // <AiOutlineMinus />
        ),
      ]),
      getItem("FG(s) Return", "B38", <MdDashboard />, [
        getItem(
          <Link to="/warehouse/fg-return/create">Create FG Return</Link>,
          "B381"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/warehouse/fg-return/pending">Pending Reversals</Link>,
          "B382"
          // <AiOutlineMinus />
        ),
      ]),
      getItem("Material Transfer", "B36", <MdDashboard />, [
        getItem(
          <Link to="/material-transfer/rm-to-rm">RM To RM</Link>,
          "B361"
          // <MdDashboard />
        ),
        // getItem(
        //   <Link to="/sf-to-rm">SF To RM</Link>,
        //   "B362"
        //   // <MdDashboard />
        // ),
        getItem(
          <Link to="/material-transfer/rm-to-rej">RM To REJ</Link>,
          "B363"
          // <MdDashboard />
        ),
        getItem(
          <Link to="/material-transfer/jw-to-jw">JW To JW</Link>,
          "B365"
          // <MdDashboard />
        ),
        getItem(
          <Link to="/material-transfer/pending-transfer">Pending Transfer(s)</Link>,
          "B364"
          // <MdDashboard />
        ),
      ]),
      getItem(
        <Link to="/warehouse/rejection">Rejection Out</Link>,
        "B37"
        // <AiOutlineMinus />
      ),
      getItem("Jobwork", "B6", <MdQueryStats />, [
        getItem(
          <Link to="/warehouse/job-work/create">Jobwork & Analysis</Link>,
          "B61"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/jobwork/update/supplementary">Jobwork Update</Link>,

          "B63"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/job-work/vendor/sfg/min">Vendor SFG MIN</Link>,

          "B62"
          // <AiOutlineMinus />
        ),
      ]),
      getItem("Work Order", "B7", <MdQueryStats />, [
        getItem(<Link to="/wo/create">Create</Link>, "B71"),
        getItem(<Link to="/wo/analysis">Analysis</Link>, "B72"),
        getItem(<Link to="/wo/create-challan">Create Challan</Link>, "B73"),
        //
        getItem(
          <Link to="/wo/create-scrape-challan">SCRAPE Challan</Link>,
          "B74"
        ),
        getItem(<Link to="/wo/shipment">Shipment</Link>, "B75"),
        getItem(<Link to="/wo/view-challan">View Challan</Link>, "B76"),
        getItem(<Link to="/wocompleted">Completed</Link>, "B77"),
        getItem(<Link to="/woreport">Report</Link>, "B78"),
      ]),
      getItem(
        <Link to="/warehouse/dc/create">RGP - DC</Link>,
        "B44"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/warehouse/branch-transfer/challan">Branch Transfer Challan</Link>,
        "B45"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/warehouse/gp/create">Gatepass (RGP / NRGP)</Link>,
        "B39"
        // <AiOutlineMinus />
      ),
      // getItem(
      //   <Link to="/warehouse/physical/create">Physical Stock (Store)</Link>,
      //   "B40"
      //   // <AiOutlineMinus />
      // ),
      // Part Code Conversion
      getItem(
        <Link to="/warehouse/part-code-conversion">Part Code Conversion</Link>,
        "B46"
        // <AiOutlineMinus />
      ),
    ]),
    getItem("Sales Order", "C5", <TbReportAnalytics />, [
      getItem(<Link to="/sales-order/register">Register</Link>, "E51"),
      getItem(
        <Link to="/sales-order/create">Create order</Link>,
        "C52"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/sales-order/challan">Challan</Link>,
        "C53"
        // <AiOutlineMinus />
      ),
      getItem(
        <Link to="/sales-order/shipments">Shipment</Link>,
        "C54"
        // <AiOutlineMinus />
      ),
    ]),
    getItem("Reports", "B4", <TbReportAnalytics />, [
      getItem("Inventory Reports", "B41", <MdDashboard />, [
        getItem(
          <Link to="/reports/transaction-in">MIN Register</Link>,
          "B411"
          // <AiOutlineMinus />
        ),

        getItem(<Link to="/weeklyAudit">Weekly Audit</Link>, "B414"),
        getItem(
          <Link to="/reports/transaction-out">RM Issue Register</Link>,
          "B412"
          // <AiOutlineMinus />
        ),
        // getItem(
        //   <Link to="/weeklyaudit">Weekly Audit</Link>,
        //   "B414"
        //   // <AiOutlineMinus />
        // ),
        getItem(
          <Link to="/r1">Reports R1 - R37 </Link>,

          "B413"
          // <AiOutlineMinus />
        ),
      ]),
      getItem(
        <Link to="/warehouse/print-view-min">Print and View MIN Label</Link>,
        "B42"
        // <AiOutlineMinus />
      ),
      // getItem(
      //   <Link to="/warehouse/eway-bill/report">E-Way Bill Report</Link>,
      //   "B47"
      //   // <AiOutlineMinus />
      // ),
    ]),
    getItem("Query", "B5", <MdQueryStats />, [
      getItem(
        <Link to="/query/item-all-logs">Q1 - Q6</Link>,
        "C51"
        // <AiOutlineMinus />
      ),
      // getItem(
      //   <Link to="/sku-query">SKU Query</Link>,
      //   "B52"
      //   // <AiOutlineMinus />
      // ),
    ]),
  ]),

  getItem("Production", "C", <IoFileTrayStacked />, [
    getItem("PPC", "C1", <MdDashboard />, [
      getItem("Material Requisition", "C11", <MdDashboard />, [
        getItem(
          <Link to="/reqWithBom">Req With BOM</Link>,
          "C111"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/req-with-out-bom">Req Without BOM</Link>,
          "C112"
          // <AiOutlineMinus />
        ),
      ]),
      getItem("Production and Plan (s)", "C12", <MdDashboard />, [
        getItem(
          <Link to="/create-ppr">Create PPR</Link>,
          "C121"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/pending-ppr">Pending PPR</Link>,
          "C122"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/completed-ppr">Completed PPR</Link>,
          "C123"
          // <AiOutlineMinus />
        ),
      ]),

      getItem("Location Movement", "C14", <MdDashboard />, [
        getItem(
          <Link to="/sf-to-sf">SF To SF</Link>,
          "C141"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/sf-to-rej">SF To REJ</Link>,
          "C142"
          // <AiOutlineMinus />
        ),
      ]),
    ]),
    // getItem("QCA", "C2", <MdDashboard />, [
    //   getItem(
    //     <Link to="/sample-qc">Create Sample</Link>,
    //     "C131"
    //     // <AiOutlineMinus />
    //   ),
    //   getItem(
    //     <Link to="/pending-qc">Pending Sample</Link>,
    //     "C132"
    //     // <AiOutlineMinus />
    //   ),
    //   getItem(
    //     <Link to="/completed-qc">Completed Sample</Link>,
    //     "C133"
    //     // <AiOutlineMinus />
    //   ),
    //   getItem(
    //     <Link to="/report-qc">QC Report</Link>,
    //     "C134"
    //     // <AiOutlineMinus />
    //   ),
    // ]),
    getItem("Query", "C3", <MdQueryStats />, [
      getItem(
        <Link to="/query/item-all-logs">Q1 - Q6</Link>,
        "C31"
        // <AiOutlineMinus />
      ),
      // getItem(
      //   <Link to="/sku-query">SKU Query</Link>,
      //   "C32"
      //   // <AiOutlineMinus />
      // ),
    ]),

    getItem("Reports", "C4", <TbReportAnalytics />, [
      getItem("Inventory Reports", "C41", <MdDashboard />, [
        getItem(
          <Link to="/reports/transaction-in">MIN Register</Link>,
          "C411"
          // <AiOutlineMinus />
        ),
        getItem(<Link to="/reports/transaction-out">RM Issue Register</Link>, "C412"),
        getItem(<Link to="/weeklyAudit">Weekly Audit</Link>, "C414"),

        getItem(
          <Link to="/r1">Reports R1 - R35</Link>,

          "C413"
          // <AiOutlineMinus />
        ),
      ]),
    ]),
    getItem(
      <Link to="/production/ppc">Production MIS</Link>,
      "D6",
      <MdAccountBox />
    ),
    // getItem(
    //   <Link to="/production/physical-stock/create">Physical Stock</Link>,
    //   "D5",
    //   <MdAccountBox />
    // ),
  ]),
  //Legal
  // user?.showlegal
  // ?

  // getItem("Legal", "X", <FontAwesomeIcon icon={faScaleBalanced} />, [
  //   getItem("Master", "X1", <DeliveredProcedureOutlined />, [
  //     getItem(<Link to="/legal/create-party">Add Party</Link>, "X11"),
  //     getItem(
  //       <Link to="/legal/add-agreement-type">Add Type Of Agreement</Link>,
  //       "X12"
  //     ),
  //   ]),
  //   getItem("Agreements", "X2", <DeliveredProcedureOutlined />, [
  //     getItem(<Link to="/legal/create-agreement">Create Agreement</Link>, "X21"),
  //     getItem(<Link to="/legal/view-agreement">View Agreement</Link>, "X22"),
  //   ]),
  // ]),
  // : null,

  //MES
  getItem("MES", "Z", <DeploymentUnitOutlined />, [
    getItem("QA Process", "Z1", <DeliveredProcedureOutlined />, [
      getItem(<Link to="/master/qa-process">Create Process</Link>, "Z11"),
      getItem(
        <Link to="/master/qa-process-map">Create Process Map</Link>,
        "Z12"
      ),
    ]),
    getItem("QCA", "Z2", <CheckCircleOutlined />, [
      getItem(<Link to="/print-qc-label">Print QCA Label</Link>, "Z21"),
      getItem(<Link to="/qc-check">QC Check</Link>, "Z22"),
      getItem(<Link to="/qca/report">QC Report</Link>, "Z23"),
    ]),
  ]),
  // getItem("MES", "Z", <DeploymentUnitOutlined />, [
  //   getItem(
  //     <Link to="/mes/process/create">Create Process</Link>,
  //     "G1",

  //     []
  //   ),
  //   // getItem('QCA', 'G2',<CheckCircleOutlined />,[
  //   //   getItem(<Link to='/print-qc-label'>Print QCA Label</Link>,'G21'),
  //   //   getItem(<Link to='/qc-check'>QC Check</Link>,'G22'),
  //   //   getItem(<Link to='/report-qc'>QC Report</Link>,'G23'),
  //   // ]),
  // ]),
  // getItem("CPM", "E", <CalculatorFilled />, [
  //   getItem(<Link to="/CPM/CPM-analysis">CPM Analysis</Link>, "E1"),
  //   getItem(<Link to="/CPM/report">CPM Finance</Link>, "reports/cpm"),
  // ]),
  // getItem("Analysis", "F", <SiPaytm />, [
  //   // getItem(
  //   //   <Link to="/paytm-qc/upload">Paytm QC Upload updated to check</Link>,
  //   //   "F1"
  //   // ),
  //   // getItem(<Link to="paytm-qc/update">Paytm QC Update</Link>, "F2"),
  //   getItem(<Link to="/analysis/paytm-qc">Paytm QC Report</Link>, "F1"),
  //   getItem(
  //     <Link to="/analysis/paytm-refurbishment">Paytm Refurbishment</Link>,
  //     "F2"
  //   ),
  // ]),
  // getItem(<Link to="/sop">SOP's</Link>, "/sop", <FormOutlined />),
  getItem(
    <Link to="/invoice/create">Sales & Distribution</Link>,
    "/invoice/create",
    <UnorderedListOutlined />
  ),
  getItem(
    "Research and Development",
    "Research and Development",
    <ExperimentOutlined />,
    [
      getItem(
        <Link to={routeConstants.researchAndDevelopment.products.create}>
          Products
        </Link>,
        routeConstants.researchAndDevelopment.products.create
      ),
      getItem(
        <Link to={routeConstants.researchAndDevelopment.bom.create}>
          Bill of Material
        </Link>,
        routeConstants.researchAndDevelopment.bom.create
      ),
    ]
  ),
  // user?.type == "developer"
  //   ? getItem(
  //       <Link to="/controlPanel/registeredUsers">Control Panel</Link>,
  //       "/controlPanel/registeredUsers",
  //       <ControlOutlined />
  //     )
  //   : "",
];

export const items1 = (user, setShowTickets) => [
  // getItem(
  //   <Link onClick={() => setShowTickets(true)}>Tickets</Link>,
  //   "B",
  //   <CustomerServiceOutlined />
  // ),
  getItem(<Link to="/changelog/history">Changelog History</Link>, "V", <ContainerOutlined />),
  getItem(<Link to="/myprofile">Profile</Link>, "A", <UserOutlined />),
];
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}
