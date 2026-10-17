import type { AuthoringStep, ProcessAggregate } from "@sop/domain";

const sourceSteps: Array<{ title: string; note: string }> = [
  {
    title: "Nhận giấy giới thiệu từ đại lý",
    note: "Thông tin trên giấy giới thiệu khớp với thông tin lái xe và hàng hóa cần lấy.",
  },
  { title: "Scan gửi cho KVC staff bởi e-mail", note: "" },
  { title: "Nhận thông tin hàng xuất từ KVC staff bởi e-mail", note: "" },
  {
    title: "Chuẩn bị hồ sơ giấy tờ liên quan",
    note: "In đủ tất cả các loại giấy. Theo từng bộ 1 by 1.",
  },
  {
    title: "Di chuyển hàng chờ xuất đến vị trí quy định",
    note: "Lưu ý an toàn khi di chuyển, dừng đỗ.",
  },
  {
    title: "Kiểm tra lại 1 lần số khung số máy của máy cần giao",
    note: "Luôn kiểm tra 2 lần số khung số máy đối với hàng xuất.",
  },
  {
    title: "Kiểm tra cùng lái xe hiện trạng máy",
    note: "Sử dụng checksheet để kiểm tra đầy đủ các hạng mục.",
  },
  {
    title: "Lái xe ký xác nhận các giấy tờ liên quan",
    note: "Ký và ghi rõ họ tên đầy đủ.",
  },
  {
    title: "Bàn giao máy cho lái xe",
    note: "Di chuyển máy lên xe tải cho lái xe.",
  },
  {
    title: "Bảo vệ ký giấy ra cổng",
    note: "Bảo vệ giữ lại liên màu xanh.",
  },
  {
    title: "Lưu trữ giấy tờ tài liệu. Kết thúc",
    note: "Hàng ngày kiểm tra lại lượng giấy tờ đã lưu xem có khớp không.",
  },
];

const steps: AuthoringStep[] = sourceSteps.map((source, index) => ({
  stepCode: `SAMPLE-${String(index + 1).padStart(2, "0")}`,
  sequenceNo: index + 1,
  title: source.title,
  prerequisiteText: "",
  inputText: "",
  instruction: source.title,
  noteText: source.note,
  warningText: "",
  expectedResult: "",
  outputText: "",
  isRequired: true,
  targetDurationSec: 0,
  businessRoleCodes: [],
  stepStartPolicy: "STRICT_SEQUENTIAL",
}));

export const shippingSample: ProcessAggregate = {
  id: "sample-shipping",
  code: "SAMPLE-SHIPPING",
  ownerUserId: "PROCESS_OWNER_SAMPLE",
  groupId: null,
  orgScopeId: "ROOT-SAMPLE",
  status: "SAMPLE",
  versions: [
    {
      processId: "sample-shipping",
      versionNo: 1,
      name: "Xuất hàng đến đại lý",
      purpose: "",
      scopeText: "",
      audience: "",
      triggerText: "",
      finishCondition: "",
      reviewTriggersJson: null,
      status: "DRAFT",
      changeSummary: "Khởi tạo fixture SAMPLE từ 11 bước nguồn SRS Rev.10",
      effectiveFrom: null,
      effectiveTo: null,
      reviewDueAt: null,
      steps,
    },
  ],
};
