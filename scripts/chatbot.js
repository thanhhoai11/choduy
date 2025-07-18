document.addEventListener('DOMContentLoaded', function() {
    // Inject the HTML structure for the chatbot into the body
    const chatbotHTML = `
        <button id="chatbotToggle">⌘</button>
        <div id="chatbotPopup">
            <div class="chat-header">
                <span>Anh Em Rọt Assistant</span>
                <button id="closeChat" style="background: none; border: none; color: white; font-size: 20px;">×</button>
            </div>
            <div id="chatbotMessages"></div>
            <div class="quick-replies" id="quickReplies"></div>
            <div class="input-container">
                <input type="text" id="userInput" placeholder="Nhập câu hỏi của bạn..." autocomplete="off">
                <button id="sendBtn">Gửi</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotPopup = document.getElementById('chatbotPopup');
    const closeChat = document.getElementById('closeChat');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const quickReplies = document.getElementById('quickReplies');

    // Mở/đóng chat
    chatbotToggle.addEventListener('click', function() {
        chatbotPopup.classList.toggle('active');
        if (chatbotPopup.classList.contains('active')) {
            // Khi mở chat, hiển thị lại quick replies
            quickReplies.classList.remove('hidden');
        } else {
            // Khi đóng chat, ẩn quick replies (nếu cần)
            quickReplies.classList.add('hidden');
        }
    });

    closeChat.addEventListener('click', function() {
        chatbotPopup.classList.remove('active');
        quickReplies.classList.add('hidden'); // Ẩn khi đóng
    });

    // Câu hỏi nhanh
    const quickQuestions = [
        "Địa chỉ cửa hàng?",
        "Giờ làm việc thế nào?",
        "MacBook Air M2 còn hàng không?",
        "iPad Pro M2 có màu gì?",
        "Có AirPods Pro 2 không?",
        "Có phụ kiện nào cho iPhone không?",
        "Chính sách bảo hành?",
        "Có trả góp không?",
        "Khuyến mãi hiện tại?",
        "Ưu đãi cho học sinh sinh viên?"
    ];

    quickQuestions.forEach(question => {
        const btn = document.createElement('div');
        btn.className = 'quick-reply';
        btn.textContent = question;
        btn.addEventListener('click', function() {
            userInput.value = question;
            sendMessage();
            quickReplies.classList.add('hidden'); // Ẩn quick replies khi bấm
        });
        quickReplies.appendChild(btn);
    });

    // Gửi tin nhắn
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage('user', message);
        userInput.value = '';

        // Ẩn quick replies sau khi gửi tin nhắn thủ công
        quickReplies.classList.add('hidden');

        // Hiệu ứng đang gõ
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatbotMessages.appendChild(typingIndicator);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        // Giả lập thời gian phản hồi
        setTimeout(() => {
            typingIndicator.remove();
            const response = generateResponse(message);
            addMessage('bot', response);
            // Sau khi bot trả lời, hiển thị lại quick replies
            //quickReplies.classList.remove('hidden');
        }, 800 + Math.random() * 1000);
    }

    // Xử lý tin nhắn và tạo phản hồi thông minh
    function generateResponse(message) {
        const lowerMsg = message.toLowerCase();

        // Thông tin cửa hàng
        const storeInfo = {
            name: "Anh Em Rọt - Apple Authorized Reseller",
            address: "12 Chùa Bộc, Quang Trung, Đống Đa, Hà Nội",
            phone: "0243.123.4567",
            hotline: "0987.654.321",
            email: "contact@anhemrot.com",
            hours: {
                weekday: "9:00 - 21:00 (Thứ 2 - Thứ 6)",
                weekend: "10:00 - 20:00 (Thứ 7 & CN)"
            },
            map: "https://maps.apple.com/?address=12+Chua+Boc"
        };

        const contactInfo = `\n\nBạn có thể liên hệ chúng tôi qua Hotline/Zalo: ${storeInfo.hotline} để được tư vấn chi tiết hơn nhé!`;

        // Dữ liệu sản phẩm chi tiết
        const products = {
            dienthoai: [
                { model: "iphone 15 pro max", status: "Còn hàng", price: "43.990.000đ", colors: "Titan xanh, Titan đen, Titan tự nhiên, Titan trắng", storage: "256GB, 512GB, 1TB", promotion: "Tặng dán màn hình, giảm 50% ốp lưng" },
                { model: "iphone 15 pro", status: "Còn hàng", price: "28.990.000đ", colors: "Titan xanh, Titan đen, Titan tự nhiên, Titan trắng", storage: "128GB, 256GB, 512GB, 1TB" },
                { model: "iphone 15 plus", status: "Còn hàng", price: "23.990.000đ", colors: "Đen, Xanh dương, Xanh lá, Hồng, Vàng", storage: "128GB, 256GB, 512GB" },
                { model: "iphone 15", status: "Tạm hết", restock: "25/12", price: "20.990.000đ", colors: "Đen, Xanh dương, Xanh lá, Hồng, Vàng", storage: "128GB, 256GB, 512GB" },
                { model: "iphone 14 pro max", status: "Còn hàng", price: "26.990.000đ", colors: "Tím đậm, Vàng, Bạc, Đen", storage: "128GB, 256GB, 512GB, 1TB", promotion: "Giảm 10%" },
                { model: "iphone 14 pro", status: "Còn hàng", price: "23.990.000đ", colors: "Tím đậm, Vàng, Bạc, Đen", storage: "128GB, 256GB, 512GB, 1TB" },
                { model: "iphone 14 plus", status: "Còn hàng", price: "19.990.000đ", colors: "Đen, Trắng, Xanh dương, Tím", storage: "128GB, 256GB, 512GB" },
                { model: "iphone 14", status: "Còn hàng", price: "17.990.000đ", colors: "Đen, Trắng, Xanh dương, Tím", storage: "128GB, 256GB, 512GB", promotion: "Giảm 10%" },
                { model: "iphone 13", status: "Còn hàng", price: "15.990.000đ", colors: "Đen, Trắng, Hồng, Xanh lá", storage: "128GB, 256GB, 512GB" }
            ],
            macbook: [
                { model: "macbook air m1", status: "Còn hàng", price: "21.990.000đ", chip: "M1", ram: "8GB, 16GB", storage: "256GB, 512GB", colors: "Space Gray, Gold, Silver" },
                { model: "macbook air m2", status: "Còn hàng", price: "27.990.000đ", chip: "M2", ram: "8GB, 16GB, 24GB", storage: "256GB, 512GB, 1TB, 2TB", colors: "Midnight, Starlight, Space Gray, Silver" },
                { model: "macbook pro 14 m2", status: "Còn hàng", price: "42.990.000đ", chip: "M2 Pro, M2 Max", ram: "16GB, 32GB, 64GB, 96GB", storage: "512GB, 1TB, 2TB, 4TB, 8TB", colors: "Space Gray, Silver" },
                { model: "macbook pro 16 m2", status: "Còn hàng", price: "55.990.000đ", chip: "M2 Pro, M2 Max", ram: "16GB, 32GB, 64GB, 96GB", storage: "512GB, 1TB, 2TB, 4TB, 8TB", colors: "Space Gray, Silver" }
            ],
            ipad: [
                { model: "ipad pro m2", status: "Còn hàng", price: "22.990.000đ", chip: "M2", sizes: "11 inch, 12.9 inch", storage: "128GB, 256GB, 512GB, 1TB, 2TB", colors: "Bạc, Xám không gian" },
                { model: "ipad air 5", status: "Còn hàng", price: "16.990.000đ", chip: "M1", colors: "Xám không gian, Ánh sao, Hồng, Tím, Xanh lam", storage: "64GB, 256GB" },
                { model: "ipad mini 6", status: "Tạm hết hàng", restock: "20/12", price: "14.990.000đ", chip: "A15 Bionic", storage: "64GB, 256GB", colors: "Xám không gian, Ánh sao, Tím, Hồng" },
                { model: "ipad 10th gen", status: "Còn hàng", price: "11.990.000đ", chip: "A14 Bionic", storage: "64GB, 256GB", colors: "Bạc, Hồng, Xanh dương, Vàng" }
            ],
            airpod: [
                { model: "airpods pro 2", status: "Còn hàng", price: "5.490.000đ", connectivity: "MagSafe Charging Case (USB-C)", features: "Chống ồn chủ động, Xuyên âm thích ứng, Âm thanh không gian cá nhân hóa" },
                { model: "airpods 3", status: "Còn hàng", price: "4.290.000đ", connectivity: "Lightning Charging Case", features: "Âm thanh không gian cá nhân hóa, Chống mồ hôi và nước" },
                { model: "airpods 2", status: "Còn hàng", price: "2.990.000đ", connectivity: "Charging Case", features: "Chip H1, Kích hoạt Siri bằng giọng nói" }
            ],
            phu_kien: [
                { model: "apple pencil 2", status: "Còn hàng", price: "3.490.000đ", compatibility: "iPad Pro, iPad Air, iPad mini đời mới" },
                { model: "magic keyboard", status: "Còn hàng", price: "7.990.000đ", compatibility: "iPad Pro, iPad Air", features: "Trackpad tích hợp, đèn nền" },
                { model: "ốp lưng iphone 15 series", status: "Còn hàng", price: "890.000đ", material: "Silicone, Clear Case, FineWoven", promotion: "Giảm 50% khi mua kèm iPhone" },
                { model: "sạc magsafe", status: "Còn hàng", price: "1.290.000đ", features: "Sạc không dây từ tính", compatibility: "iPhone 12 trở lên" },
                { model: "dây sạc usb-c to lightning", status: "Còn hàng", price: "490.000đ", length: "1m, 2m" }
            ],
            applewatch: [
                { model: "apple watch series 9", status: "Còn hàng", price: "11.990.000đ", sizes: "41mm, 45mm", colors: "Midnight, Starlight, Red, Silver", features: "Màn hình Always-On, chip S9, chống nước WR50" },
                { model: "apple watch se 2", status: "Còn hàng", price: "7.990.000đ", sizes: "40mm, 44mm", colors: "Midnight, Starlight, Silver", features: "Theo dõi nhịp tim, phát hiện té ngã, chống nước" },
                { model: "apple watch ultra 2", status: "Tạm hết", restock: "20/06", price: "19.990.000đ", sizes: "49mm", colors: "Titanium", features: "Định vị GPS 2 tần số, pin 36 giờ, chống nước WR100" }
            ]
        };

        // Xác định chủ đề câu hỏi
        if (/(địa chỉ|ở đâu|chỗ nào|đến thế nào|chỉ đường)/.test(lowerMsg)) {
            return `📍 ${storeInfo.name}\n` +
                   `🏠 ${storeInfo.address}\n` +
                   `🗺️ Xem bản đồ: ${storeInfo.map}\n\n` +
                   `📞 ${storeInfo.phone} | Hotline: ${storeInfo.hotline}`;

        } else if (/(giờ mở|mấy giờ|thời gian|đóng cửa)/.test(lowerMsg)) {
            return `🕒 Giờ làm việc:\n` +
                   `- ${storeInfo.hours.weekday}\n` +
                   `- ${storeInfo.hours.weekend}\n\n` +
                   `Ngày lễ: 10:00 - 18:00`;

        } else if (/(liên hệ|số điện|phone|hotline|email)/.test(lowerMsg)) {
            return `📞 Liên hệ với chúng tôi:\n` +
                   `- Điện thoại: ${storeInfo.phone}\n` +
                   `- Hotline/Zalo: ${storeInfo.hotline}\n` +
                   `- Email: ${storeInfo.email}`;
        } else if (/(dienthoai|điện thoại|iphones)/.test(lowerMsg)) {
            return checkProductStock("dienthoai", lowerMsg, products, contactInfo);
        } else if (/(applewatch|macbook|ipad|airpod|phụ kiện|sản phẩm|hàng|tồn kho|còn hàng|màu gì|màu nào|dung lượng|bản bao nhiêu)/.test(lowerMsg)) {
            let productType = null;
            if (lowerMsg.includes("macbook")) {
                productType = "macbook";
            } else if (lowerMsg.includes("apple watch") || lowerMsg.includes("applewatch")) {
                productType = "applewatch";
            } else if (lowerMsg.includes("ipad")) {
                productType = "ipad";
            } else if (lowerMsg.includes("airpod") || lowerMsg.includes("airpods")) {
                productType = "airpod";
            } else if (lowerMsg.includes("phụ kiện") || lowerMsg.includes("phu kien") || lowerMsg.includes("sạc") || lowerMsg.includes("ốp lưng") || lowerMsg.includes("pencil") || lowerMsg.includes("magic keyboard")) {
                productType = "phu_kien";
            }

            if (productType) {
                return checkProductStock(productType, lowerMsg, products, contactInfo);
            }
            return "Chúng tôi có đầy đủ sản phẩm Apple chính hãng và phụ kiện. Bạn cần hỏi cụ thể loại sản phẩm nào ạ?";

        } else if (/(giá|bao nhiêu|price)/.test(lowerMsg)) {
            let response = getPriceInfo(lowerMsg, products);
            if (lowerMsg.includes("dienthoai")) {
                response += contactInfo;
            }
            return response;

        } else if (/(học sinh|sinh viên|hssv|ưu đãi hssv|khuyến mãi học sinh|chính sách học sinh)/.test(lowerMsg)) {
            return `📚 **Chính sách ưu đãi dành cho Học sinh/Sinh viên:**\n` +
                   `- Giảm thêm **1%** trên tổng giá trị hóa đơn (áp dụng cho các sản phẩm Apple chính)\n` +
                   `- Ưu đãi đặc biệt khi mua combo (ví dụ: MacBook + iPad)\n` +
                   `- Miễn phí cài đặt phần mềm và hỗ trợ kỹ thuật trọn đời\n` +
                   `- Yêu cầu: Vui lòng xuất trình thẻ học sinh/sinh viên hoặc giấy tờ xác nhận đang theo học hợp lệ tại thời điểm mua hàng.`;

        } else if (/(trả góp|installment)/.test(lowerMsg)) {
            return `💳 Chính sách trả góp:\n` +
                   `- Trả góp 0% qua thẻ tín dụng\n` +
                   `- Kỳ hạn 6/12 tháng\n` +
                   `- Thủ tục đơn giản, duyệt nhanh trong 15 phút\n` +
                   `- Chỉ cần CCCD/CMND + thẻ tín dụng`;

        } else if (/(bảo hành|warranty)/.test(lowerMsg)) {
            return `🛡️ Chính sách bảo hành:\n` +
                   `- Bảo hành chính hãng 12 tháng tại tất cả trung tâm ủy quyền Apple\n` +
                   `- Đổi mới 30 ngày đầu nếu lỗi do nhà sản xuất\n` +
                   `- Hỗ trợ mua gói bảo hành mở rộng AppleCare+`;

        } else if (/(khuyến mãi|giảm giá|sale|ưu đãi)/.test(lowerMsg)) {
            return `🎁 Ưu đãi hiện tại:\n` +
                   `- Giảm đến 10% cho các sản phẩm iPhone đời cũ (tùy mẫu)\n` +
                   `- Tặng kèm phụ kiện chính hãng khi mua MacBook/iPad\n` +
                   `- Giảm thêm 1% cho khách hàng là học sinh/sinh viên\n` +
                   `- Miễn phí cài đặt phần mềm và hỗ trợ kỹ thuật trọn đời sản phẩm.`;

        } else if (/(cảm ơn|thanks)/.test(lowerMsg)) {
            return "Cảm ơn bạn đã liên hệ! Nếu cần thêm thông tin gì, cứ thoải mái hỏi nhé 😊";

        } else {
            return "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể hỏi về:\n" +
                   "- Địa chỉ/giờ mở cửa\n" +
                   "- Tình trạng hàng hóa (ví dụ: 'Điện thoại còn hàng không?', 'MacBook Air M2 giá bao nhiêu?', 'iPad Pro M2 có màu gì?', 'Có AirPods Pro 2 không?', 'Giá ốp lưng iPhone là bao nhiêu?')\n" +
                   "- Giá cả sản phẩm\n" +
                   "- Chính sách bảo hành/trả góp\n" +
                   "- Ưu đãi cho Học sinh/Sinh viên\n" +
                   "Hoặc chọn một trong các câu hỏi nhanh bên dưới!";
        }
    }

    // Hàm hỗ trợ kiểm tra kho sản phẩm cụ thể và trả lời chi tiết (Áp dụng cho iPhone, MacBook, iPad, AirPod, Phụ kiện)
    function checkProductStock(type, msg, productsData, contactInfo) {
        const productList = productsData[type];
        let foundSpecificProduct = null;
        let matchedSeriesNumber = null;

        // Sắp xếp để ưu tiên các model có tên dài hơn (ví dụ: "15 pro max" trước "15")
        // Điều này giúp khớp chính xác hơn nếu người dùng hỏi tên đầy đủ
        const sortedProductList = [...productList].sort((a, b) => b.model.length - a.model.length);

        for (const product of sortedProductList) {
            if (msg.includes(product.model)) {
                foundSpecificProduct = product;
                break;
            }
        }

        // Nếu tìm thấy một sản phẩm cụ thể, trả lời chi tiết về sản phẩm đó
        if (foundSpecificProduct) {
            let response = `Thông tin về ${foundSpecificProduct.model.toUpperCase()}:\n`;
            response += `- Tình trạng: ${foundSpecificProduct.status}`;
            if (foundSpecificProduct.status === "Tạm hết" && foundSpecificProduct.restock) {
                response += ` (dự kiến có lại vào ${foundSpecificProduct.restock})`;
            }
            response += `\n- Giá: ${foundSpecificProduct.price}\n`;
            // Thêm các thuộc tính đặc trưng cho từng loại sản phẩm
            if (foundSpecificProduct.colors) response += `- Màu sắc: ${foundSpecificProduct.colors}\n`;
            if (foundSpecificProduct.storage) response += `- Dung lượng: ${foundSpecificProduct.storage}\n`;
            if (foundSpecificProduct.chip) response += `- Chip: ${foundSpecificProduct.chip}\n`;
            if (foundSpecificProduct.ram) response += `- RAM: ${foundSpecificProduct.ram}\n`;
            if (foundSpecificProduct.sizes) response += `- Kích thước: ${foundSpecificProduct.sizes}\n`;
            if (foundSpecificProduct.connectivity) response += `- Kết nối: ${foundSpecificProduct.connectivity}\n`; // AirPod
            if (foundSpecificProduct.features) response += `- Tính năng nổi bật: ${foundSpecificProduct.features}\n`; // AirPod, Phụ kiện
            if (foundSpecificProduct.compatibility) response += `- Tương thích: ${foundSpecificProduct.compatibility}\n`; // Phụ kiện
            if (foundSpecificProduct.material) response += `- Chất liệu: ${foundSpecificProduct.material}\n`; // Phụ kiện
            if (foundSpecificProduct.length) response += `- Chiều dài: ${foundSpecificProduct.length}\n`; // Phụ kiện
            if (foundSpecificProduct.promotion) response += `- Khuyến mãi: ${foundSpecificProduct.promotion}\n`;

            return response.trim() + contactInfo;
        }

        // Nếu không tìm thấy sản phẩm cụ thể, thử tìm dòng sản phẩm chung
        // Ví dụ: "iphone 15" -> tìm các model có số "15", hoặc "có ipad không"
        // Hoặc tìm kiếm loại sản phẩm chung như "airpod" hay "phụ kiện"
        let regexPattern;
        if (type === "airpod") {
            regexPattern = `\\b(airpod|airpods)\\s*(\\d+)?\\b`;
        } else if (type === "phu_kien") {
            regexPattern = `\\b(phụ kiện|phu kien|sạc|ốp lưng|pencil|magic keyboard)\\b`; // Phụ kiện không có số series phổ biến
        } else if (type === "dienthoai") {
            regexPattern = `\\b(dienthoai|iphone)\\s*(\\d+)?\\b`; // Thêm 'iphone' vào regex cho 'dienthoai'
        } else if (type === "applewatch") {
            regexPattern = `\\b(apple watch|applewatch)\\s*(\\d+)?\\b`;
        } else {
            regexPattern = `\\b(${type})\\s*(\\d+)?\\b`;
        }

        const seriesMatch = msg.match(new RegExp(regexPattern));

        if (seriesMatch && (seriesMatch[1].includes(type) || (type === "phu_kien" && /(phụ kiện|phu kien|sạc|ốp lưng|pencil|magic keyboard)/.test(seriesMatch[1])) || (type === "dienthoai" && /(dienthoai|iphone)/.test(seriesMatch[1])))) {
            matchedSeriesNumber = seriesMatch[2];

            // Nếu có số series hoặc chỉ hỏi tên loại sản phẩm chung (ví dụ "có ipad không", "có airpod không", "có phụ kiện không")
            if (matchedSeriesNumber || msg.includes(type.replace('_',' '))) { // 'type.replace('_',' ')' để chuyển 'phu_kien' thành 'phu kien' khi so sánh
                const modelsInSeries = productList.filter(p =>
                    p.model.includes(type.replace('_',' ')) && (!matchedSeriesNumber || p.model.includes(matchedSeriesNumber))
                );

                if (modelsInSeries.length > 0) {
                    let response = `Hiện tại, dòng ${type.toUpperCase().replace('_',' ')}`;
                    if (matchedSeriesNumber) response += ` ${matchedSeriesNumber}`;
                    response += ` có các model sau:\n`;

                    let hasAvailable = false;
                    modelsInSeries.forEach(p => {
                        response += `- ${p.model.toUpperCase()}:\n`;
                        response += `  Tình trạng: ${p.status === "Còn hàng" ? `Còn hàng ✅` : `Tạm hết ❌`}`;
                        if (p.restock) response += ` (dự kiến ${p.restock})`;
                        response += ` - Giá từ: ${p.price}\n`;
                        if (p.promotion) response += `  Khuyến mãi: ${p.promotion}\n`; // Chỉ hiển thị khuyến mãi chung trong danh sách

                        if (p.status === "Còn hàng") {
                            hasAvailable = true;
                        }
                    });

                    if (hasAvailable) {
                        response += `\nBạn vui lòng chọn model cụ thể để được tư vấn chi tiết hơn nhé!`;
                    } else {
                        response += `\nHiện tại, các mẫu ${type.toUpperCase().replace('_',' ')}`;
                        if (matchedSeriesNumber) response += ` ${matchedSeriesNumber}`;
                        response += ` đang tạm hết hàng. Bạn có thể tham khảo các dòng sản phẩm khác hoặc để lại thông tin để chúng tôi thông báo khi có hàng lại.`;
                    }
                    return response.trim() + contactInfo;
                }
            }
        }

        // Nếu không tìm thấy model cụ thể hay dòng, đưa ra danh sách các model đang có
        const availableModels = productList.map(p => {
            let info = p.model.toUpperCase();
            if (p.status === "Còn hàng") {
                info += ` (Còn hàng - ${p.price})`;
            } else if (p.status === "Tạm hết") {
                info += ` (Tạm hết - dự kiến ${p.restock})`;
            }
            return info;
        }).join('\n- ');

        return `Hiện tại chúng tôi có các mẫu ${type.toUpperCase().replace('_',' ')} sau:\n- ${availableModels}\n\nVui lòng hỏi cụ thể mẫu bạn quan tâm để được tư vấn chi tiết hơn nhé!` + contactInfo;
    }

    // Hàm trả về thông tin giá
    function getPriceInfo(msg, productsData) {
        const productTypes = ["dienthoai", "macbook", "ipad", "airpod", "phu_kien", "applewatch"];

        // Kiểm tra xem có sản phẩm cụ thể nào được hỏi không
        for (const type of productTypes) {
            // Cần kiểm tra kỹ từ khóa để không nhầm lẫn
            if ((type === "dienthoai" && (msg.includes("dienthoai") || msg.includes("iphone"))) ||
                (type === "macbook" && msg.includes("macbook")) ||
                (type === "ipad" && msg.includes("ipad")) ||
                (type === "airpod" && (msg.includes("airpod") || msg.includes("airpods"))) ||
                (type === "phu_kien" && (msg.includes("phụ kiện") || msg.includes("phu kien") || msg.includes("sạc") || msg.includes("ốp lưng") || msg.includes("pencil") || msg.includes("magic keyboard"))) ||
                (type === "applewatch" && (msg.includes("apple watch") || msg.includes("applewatch"))))
            {
                const productList = productsData[type];
                // Sắp xếp để ưu tiên các model có tên dài hơn
                const sortedProductList = [...productList].sort((a, b) => b.model.length - a.model.length);

                for (const product of sortedProductList) {
                    if (msg.includes(product.model)) {
                        return `💰 Giá ${product.model.toUpperCase()} là: ${product.price}. ${product.status === "Còn hàng" ? "Sản phẩm đang có sẵn." : `Sản phẩm ${product.status.toLowerCase()} ${product.restock ? `dự kiến có lại vào ${product.restock}` : ""}.`}`;
                    }
                }
                // Nếu không tìm thấy model cụ thể, trả về giá các dòng chính
                const prices = productList.map(p => {
                    let info = `- ${p.model.toUpperCase()}: ${p.price}`;
                    if (p.promotion) info += ` (KM: ${p.promotion})`;
                    return info;
                }).join('\n');
                return `💰 Giá các dòng ${type.toUpperCase().replace('_',' ')} bạn có thể tham khảo:\n${prices}\nVui lòng hỏi cụ thể model bạn quan tâm để biết giá chính xác nhất kèm khuyến mãi (nếu có) nhé.`;
            }
        }
        return "Bạn muốn xem giá sản phẩm nào ạ? Chúng tôi có iPhone, MacBook, iPad, AirPods, Apple Watch và nhiều phụ kiện Apple khác. Vui lòng hỏi cụ thể model bạn quan tâm!";
    }

    // Thêm tin nhắn vào chat
    function addMessage(sender, text) {
        const message = document.createElement('div');
        message.className = `message ${sender}`;
        // Sử dụng innerHTML để hỗ trợ xuống dòng
        message.innerHTML = text.replace(/\n/g, '<br>');
        chatbotMessages.appendChild(message);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        return message;
    }

    // Gửi khi nhấn nút
    sendBtn.addEventListener('click', sendMessage);

    // Gửi khi nhấn Enter
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Đóng popup khi nhấn ra ngoài
    window.addEventListener('click', function(event) {
        if (!chatbotPopup.contains(event.target) && !chatbotToggle.contains(event.target)) {
            chatbotPopup.classList.remove('active');
            quickReplies.classList.add('hidden'); // Ẩn khi đóng
        }
    });

    // Đóng popup khi nhấn ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            chatbotPopup.classList.remove('active');
            quickReplies.classList.add('hidden'); // Ẩn khi đóng
        }
    });

    // Tin nhắn chào mừng khi mở chat
    setTimeout(() => {
        addMessage('bot', "Xin chào! Tôi là trợ lý ảo của Anh Em Rọt - Apple Authorized Reseller. Tôi có thể giúp gì cho bạn về sản phẩm Apple hoặc dịch vụ của cửa hàng?");
    }, 800);
});
