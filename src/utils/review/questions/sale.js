export default (thread, user) => ({
  start: {
    text: `[Tin nhắn tự động] Cảm ơn bạn đã quan tâm đến Phong Vũ, mời bạn đánh giá chất lượng tư vấn của nhân viên ${user.name} để Phong Vũ cải thiện chất lượng tư vấn.`,
    quickReplies: [5, 4, 3, 2, 1].map((number) => ({
      content_type: "text",
      title: "★".repeat(number),
    })),
  },
});
