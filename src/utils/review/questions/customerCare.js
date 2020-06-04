export default () => ({
  start: {
    text:
      "[Tin nhắn tự động] Cám ơn bạn đã quan tâm đến Phong Vũ. Nhằm nâng cao dịch vụ hỗ trợ, bạn vui lòng đánh giá cuộc hội thoại này nhé.",
    quickReplies: [5, 4, 3, 2, 1].map((number) => ({
      content_type: "text",
      title: "★".repeat(number),
    })),
  },
});
