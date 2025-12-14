import { BlogPost } from "@/types/Client/Blog/BlogPost";
import { CreateBlogRequest, UpdateBlogRequest } from "@/types/Admin/BlogAPI";

// Fake data - trong thực tế sẽ fetch từ API
const getAllBlogPostsRaw = (): BlogPost[] => {
  return [
    {
      id: 1,
      title: "Đánh giá hiệu năng CPU Intel Core i9-14900K: Sức mạnh vượt trội",
      excerpt: "Intel Core i9-14900K với 24 lõi và tốc độ xung nhịp lên đến 6.0GHz mang lại hiệu năng xử lý đa nhiệm xuất sắc. CPU này là lựa chọn hàng đầu cho các game thủ và content creator đòi hỏi hiệu năng tối đa.",
      content: `Intel Core i9-14900K là flagship mới nhất của Intel với kiến trúc Raptor Lake Refresh. Với 8 Performance Cores và 16 Efficiency Cores, CPU này đạt được hiệu năng đa lõi vượt trội trong các tác vụ như render video, streaming, và gaming đồng thời.

Trong bài test Cinebench R23, i9-14900K đạt điểm đa lõi hơn 38,000 điểm, cao hơn đáng kể so với thế hệ trước. Điểm đơn lõi cũng vượt 2,100 điểm, cho thấy hiệu năng gaming tuyệt vời.

Về nhiệt độ và tiêu thụ điện, khi chạy full load, CPU có thể tiêu thụ tới 250W và nhiệt độ lên đến 95°C. Tuy nhiên, với một bộ tản nhiệt AIO 240mm chất lượng tốt, bạn có thể giữ nhiệt độ ở mức 85°C trong các tác vụ nặng.

Hiệu năng gaming của i9-14900K là xuất sắc, đặc biệt ở 1080p và 1440p. Trong các game như Cyberpunk 2077, CPU đạt trung bình 180 FPS ở 1080p Ultra, cao hơn 15% so với i9-13900K.

Kết luận: Intel Core i9-14900K là lựa chọn tuyệt vời cho những người dùng cần hiệu năng tối đa trong cả gaming và content creation. Tuy giá thành cao, nhưng hiệu năng mà nó mang lại là xứng đáng.`,
      author: "Nguyễn Minh Tuấn",
      date: "2024-01-15",
      image: "/images/item_blog/inter_core_i9.png",
      category: "CPU",
      views: 0,
      readTime: "5 phút"
    },
    {
      id: 2,
      title: "RTX 4090 vs RTX 4080: So sánh chi tiết hiệu năng gaming",
      excerpt: "RTX 4090 với 24GB VRAM và hiệu năng cao hơn 70% so với RTX 4080, nhưng liệu sự khác biệt có đáng giá?...",
      content: `RTX 4090 sử dụng kiến trúc Ada Lovelace với 16,384 CUDA cores và bộ nhớ GDDR6X 24GB. Trong các game AAA như Cyberpunk 2077 với ray tracing bật, RTX 4090 đạt trung bình 85 FPS ở 4K, trong khi RTX 4080 chỉ đạt 62 FPS. Sự khác biệt rõ rệt nhất ở độ phân giải 4K và khi bật DLSS 3.0.

Về hiệu năng, RTX 4090 nhanh hơn RTX 4080 khoảng 30-40% ở 4K, và 20-25% ở 1440p. Tuy nhiên, giá thành của RTX 4090 cao hơn gần gấp đôi.

Kết luận: Nếu bạn chơi game ở 4K và muốn hiệu năng tối đa, RTX 4090 là lựa chọn tốt. Còn nếu bạn chơi ở 1440p hoặc muốn tiết kiệm chi phí, RTX 4080 vẫn là lựa chọn hợp lý.`,
      author: "Trần Thị Hương",
      date: "2024-01-12",
      image: "/images/item_blog/rtx_4090.png",
      category: "GPU",
      views: 0,
      readTime: "7 phút"
    },
    {
      id: 3,
      title: "DDR5 vs DDR4: Lựa chọn RAM tốt nhất cho build PC 2024",
      excerpt: "RAM DDR5 với tốc độ lên đến 6400MHz mang lại hiệu năng tăng 15-20% so với DDR4 trong các tác vụ đa nhiệm. Nhưng liệu có đáng đầu tư? Phân tích chi tiết giúp bạn quyết định.",
      content: `DDR5 không chỉ có tốc độ cao hơn mà còn tiêu thụ điện năng hiệu quả hơn với điện áp 1.1V so với 1.2V của DDR4. Trong bài test với 32GB DDR5-6000MHz, hệ thống hoàn thành render video Premiere Pro nhanh hơn 18% so với DDR4-3600MHz. Tuy nhiên, giá thành DDR5 vẫn cao hơn đáng kể.

Về gaming, sự khác biệt không quá lớn, chỉ khoảng 5-10% FPS. Nhưng trong các tác vụ content creation, DDR5 thể hiện rõ ưu thế. Với các ứng dụng như Blender, After Effects, DDR5-6000MHz giúp giảm thời gian render từ 10-15% so với DDR4-3600MHz.

Một điểm quan trọng là độ trễ (latency). DDR5 có độ trễ cao hơn DDR4 ở cùng tốc độ, nhưng bù lại bằng bandwidth lớn hơn. Với các tác vụ cần bandwidth cao như video editing, DDR5 vượt trội rõ rệt.

Về tương lai, DDR5 đang trở thành chuẩn mới và giá đang giảm dần. Nếu bạn build PC mới, nên cân nhắc DDR5 để tương lai-proof hệ thống.

Kết luận: Nếu bạn là content creator hoặc làm việc với các ứng dụng nặng, DDR5 là lựa chọn tốt. Còn nếu chỉ gaming, DDR4 vẫn đủ dùng và tiết kiệm chi phí.`,
      author: "Lê Đức Anh",
      date: "2024-01-10",
      image: "/images/item_blog/ramddr5.png",
      category: "RAM",
      views: 0,
      readTime: "6 phút"
    },
    {
      id: 4,
      title: "SSD NVMe Gen4 vs Gen3: Tốc độ đọc ghi thực tế",
      excerpt: "SSD NVMe PCIe 4.0 với tốc độ đọc 7,000MB/s gấp đôi so với Gen3, nhưng liệu có đáng nâng cấp? Kiểm tra thực tế cho thấy sự khác biệt rõ rệt trong các tác vụ cụ thể.",
      content: `SSD NVMe Gen4 như Samsung 990 Pro đạt tốc độ đọc tuần tự 7,450MB/s và ghi 6,900MB/s, trong khi Gen3 chỉ đạt khoảng 3,500MB/s. Sự khác biệt rõ rệt nhất khi khởi động hệ thống, load game, và xử lý file lớn. Thời gian boot từ 15 giây giảm xuống còn 8 giây với Gen4.

Trong gaming, thời gian load game giảm khoảng 20-30% so với Gen3. Game như Cyberpunk 2077 load nhanh hơn 10-15 giây với Gen4. DirectStorage API của Microsoft cũng tận dụng tốt tốc độ Gen4, giảm thời gian load trong game đáng kể.

Với video editing, Gen4 giúp preview timeline mượt mà hơn, đặc biệt với video 4K hoặc 8K. Export video cũng nhanh hơn 15-20% so với Gen3.

Tuy nhiên, với các tác vụ hàng ngày như mở ứng dụng, duyệt web, sự khác biệt không quá lớn. Gen3 vẫn đủ nhanh cho hầu hết người dùng.

Về giá thành, Gen4 đang giảm dần và chỉ cao hơn Gen3 khoảng 20-30%. Nếu bạn build PC mới hoặc cần hiệu năng cao, Gen4 là lựa chọn hợp lý.

Kết luận: Gen4 mang lại trải nghiệm tốt hơn rõ rệt, đặc biệt khi làm việc với file lớn, gaming, và content creation. Nếu budget cho phép, nên đầu tư Gen4.`,
      author: "Phạm Thị Lan",
      date: "2024-01-08",
      image: "/images/item_blog/ssd.png",
      category: "Storage",
      views: 0,
      readTime: "4 phút"
    },
    {
      id: 5,
      title: "Cấu hình PC tối ưu cho Content Creator: Build giá dưới 50 triệu",
      excerpt: "Build PC với Ryzen 9 7900X, RTX 4070, và 32GB RAM để xử lý mượt mà các tác vụ video editing và streaming. Hướng dẫn chi tiết từng linh kiện và cách lắp ráp.",
      content: `Cấu hình tối ưu bao gồm: CPU Ryzen 9 7900X (12 lõi/24 luồng) - 12.5 triệu, GPU RTX 4070 12GB - 18 triệu, RAM DDR5-5600 32GB - 6 triệu, SSD NVMe 1TB - 3.5 triệu, Mainboard B650 - 5 triệu, và các linh kiện khác. Tổng giá khoảng 48 triệu, đủ sức xử lý 4K video editing và streaming đồng thời.

Với cấu hình này, bạn có thể render video 4K trong Premiere Pro với thời gian hợp lý, stream game ở 1080p 60fps, và chạy nhiều ứng dụng cùng lúc mà không lag.

CPU Ryzen 9 7900X với 12 lõi/24 luồng là lựa chọn tuyệt vời cho video editing. Trong test với Premiere Pro, render video 10 phút 4K mất khoảng 8-10 phút, nhanh hơn đáng kể so với các CPU giá rẻ hơn.

RTX 4070 với 12GB VRAM đủ để xử lý video 4K và hỗ trợ hardware encoding NVENC, giúp export video nhanh hơn và stream mượt mà hơn. GPU này cũng đủ mạnh để chơi game AAA ở 1440p.

RAM 32GB DDR5 là mức tối thiểu cho content creation. Với After Effects và Premiere Pro chạy đồng thời, bạn sẽ cần ít nhất 32GB để tránh lag.

SSD NVMe 1TB nên chia làm 2: 500GB cho hệ điều hành và ứng dụng, 500GB cho project files. Nên đầu tư SSD tốt như Samsung 990 Pro hoặc WD Black SN850X.

Kết luận: Đây là build PC giá trị tốt cho content creator, cân bằng giữa hiệu năng và giá thành. Có thể nâng cấp GPU lên RTX 4080 hoặc RAM lên 64GB nếu ngân sách cho phép.`,
      author: "Hoàng Văn Đức",
      date: "2024-01-05",
      image: "/images/item_blog/ryzen9.png",
      category: "Build",
      views: 0,
      readTime: "8 phút"
    },
    {
      id: 6,
      title: "Laptop Gaming vs Desktop: Hiệu năng và tính di động",
      excerpt: "Laptop gaming RTX 4080 có hiệu năng bằng 80% desktop tương ứng, nhưng giá cao hơn và khó nâng cấp. So sánh chi tiết giúp bạn quyết định phù hợp với nhu cầu.",
      content: `Laptop RTX 4080 Mobile có hiệu năng tương đương RTX 4070 Desktop do bị giới hạn về TDP (175W vs 285W). Trong game, laptop thường chạy chậm hơn 15-25% so với desktop cùng cấp. Tuy nhiên, laptop mang lại tính di động và không cần màn hình ngoài. Desktop dễ nâng cấp và có hiệu năng tốt hơn về lâu dài.

Về giá thành, laptop gaming thường đắt hơn desktop tương đương khoảng 20-30%. Nhưng nếu bạn cần tính di động, laptop là lựa chọn duy nhất.

Một điểm quan trọng là nhiệt độ. Laptop gaming thường chạy nóng hơn desktop do không gian hạn chế, dẫn đến thermal throttling và giảm hiệu năng sau thời gian dài chơi game. Desktop với case lớn và tản nhiệt tốt hơn có thể duy trì hiệu năng ổn định lâu hơn.

Về nâng cấp, desktop dễ dàng thay đổi GPU, RAM, SSD khi cần. Laptop chỉ có thể nâng cấp RAM và SSD, GPU và CPU thường được hàn chết vào mainboard.

Pin của laptop gaming chỉ đủ dùng 2-3 giờ khi chơi game, phải cắm sạc liên tục. Desktop không có vấn đề này nhưng cần nguồn điện ổn định.

Kết luận: Chọn desktop nếu bạn chủ yếu chơi game ở nhà và muốn hiệu năng tối đa, dễ nâng cấp. Chọn laptop nếu bạn cần tính di động, đi công tác, hoặc không gian sống hạn chế.`,
      author: "Đỗ Thị Mai",
      date: "2024-01-03",
      image: "/images/item_blog/laptop gameing.png",
      category: "Comparison",
      views: 0,
      readTime: "6 phút"
    },
    {
      id: 7,
      title: "Hướng dẫn chọn màn hình gaming: Tần số quét, độ phân giải và công nghệ",
      excerpt: "Màn hình gaming 144Hz, 240Hz hay 360Hz? 1080p, 1440p hay 4K? IPS, VA hay OLED? Hướng dẫn chi tiết giúp bạn chọn màn hình phù hợp với nhu cầu và ngân sách.",
      content: `Chọn màn hình gaming phù hợp là một trong những quyết định quan trọng nhất khi build PC gaming. Với nhiều lựa chọn trên thị trường, việc hiểu rõ các thông số kỹ thuật sẽ giúp bạn đưa ra quyết định đúng đắn.

Tần số quét (Refresh Rate) là yếu tố quan trọng nhất cho gaming. Màn hình 144Hz là mức tối thiểu cho gaming hiện đại, cho phép hiển thị 144 khung hình mỗi giây. Màn hình 240Hz phù hợp cho game thủ chuyên nghiệp, trong khi 360Hz là dành cho những người đam mê e-sports.

Độ phân giải cũng quan trọng không kém. 1080p (Full HD) vẫn là lựa chọn phổ biến nhất, cân bằng giữa hiệu năng và chất lượng. 1440p (2K) mang lại hình ảnh sắc nét hơn đáng kể, phù hợp với GPU RTX 3070 trở lên. 4K chỉ nên chọn nếu bạn có GPU mạnh như RTX 4080/4090.

Công nghệ panel cũng ảnh hưởng đến trải nghiệm. IPS cho màu sắc chính xác và góc nhìn rộng, phù hợp cho cả gaming và content creation. VA có độ tương phản cao hơn, tốt cho phim và game tối. OLED cho màu đen tuyệt đối và màu sắc sống động, nhưng giá cao và có nguy cơ burn-in.

Thời gian phản hồi (Response Time) cũng quan trọng. 1ms là lý tưởng cho gaming, giảm motion blur và ghosting. Adaptive Sync (G-Sync/FreeSync) giúp loại bỏ screen tearing và stuttering.

Kết luận: Chọn màn hình 1440p 144Hz IPS với G-Sync/FreeSync nếu bạn muốn cân bằng giữa chất lượng và giá thành. Nâng cấp lên 240Hz nếu bạn chơi game competitive.`,
      author: "Vũ Thành Đạt",
      date: "2024-01-20",
      image: "/images/item_blog/inter_core_i9.png",
      category: "Comparison",
      views: 0,
      readTime: "9 phút"
    },
    {
      id: 8,
      title: "Tản nhiệt CPU: Air Cooler vs AIO Liquid Cooler - So sánh chi tiết",
      excerpt: "Air cooler hay AIO liquid cooler tốt hơn? Phân tích chi tiết về hiệu năng làm mát, độ ồn, giá thành và độ bền giúp bạn chọn giải pháp tản nhiệt phù hợp.",
      content: `Tản nhiệt CPU là một trong những thành phần quan trọng nhất trong build PC, đặc biệt với các CPU hiện đại có TDP cao. Việc chọn giữa air cooler và AIO liquid cooler không chỉ ảnh hưởng đến nhiệt độ mà còn đến độ ồn và tính thẩm mỹ của hệ thống.

Air cooler sử dụng heat pipes và fins để truyền nhiệt từ CPU ra không khí. Ưu điểm của air cooler là giá rẻ, độ bền cao, không có nguy cơ rò rỉ chất lỏng, và dễ lắp đặt. Nhược điểm là kích thước lớn, có thể che khuất RAM, và hiệu năng làm mát kém hơn AIO ở cùng mức giá.

AIO (All-In-One) liquid cooler sử dụng chất lỏng để truyền nhiệt từ CPU đến radiator. Ưu điểm là hiệu năng làm mát tốt hơn, đặc biệt với các CPU TDP cao, kích thước nhỏ gọn hơn, và tính thẩm mỹ cao. Nhược điểm là giá cao hơn, có nguy cơ rò rỉ (dù rất thấp), và độ ồn từ pump.

Về hiệu năng, AIO 240mm thường làm mát tốt hơn air cooler tầm trung khoảng 5-10°C. AIO 360mm có thể tốt hơn 10-15°C so với air cooler cao cấp. Tuy nhiên, với CPU TDP dưới 150W, air cooler cao cấp như Noctua NH-D15 vẫn đủ dùng.

Về độ ồn, air cooler thường ồn hơn một chút do quạt lớn hơn, nhưng AIO có thêm tiếng ồn từ pump. Tuy nhiên, sự khác biệt không quá lớn với các sản phẩm chất lượng.

Kết luận: Chọn air cooler nếu bạn muốn tiết kiệm chi phí và độ bền cao. Chọn AIO nếu bạn có CPU TDP cao, muốn tính thẩm mỹ, hoặc case nhỏ gọn.`,
      author: "Nguyễn Văn Hùng",
      date: "2024-01-18",
      image: "/images/item_blog/rtx_4090.png",
      category: "Build",
      views: 0,
      readTime: "7 phút"
    },
    {
      id: 9,
      title: "AMD Ryzen 7 7800X3D: CPU gaming tốt nhất 2024?",
      excerpt: "Ryzen 7 7800X3D với công nghệ 3D V-Cache mang lại hiệu năng gaming vượt trội, đánh bại cả i9-14900K trong nhiều game. Liệu đây có phải CPU gaming tốt nhất?",
      content: `AMD Ryzen 7 7800X3D là CPU gaming đặc biệt với công nghệ 3D V-Cache độc quyền của AMD. Với 96MB L3 cache (gấp 3 lần so với Ryzen 7 7700X thông thường), CPU này mang lại hiệu năng gaming vượt trội.

Trong các bài test gaming, Ryzen 7 7800X3D đánh bại cả Intel Core i9-14900K trong nhiều game, đặc biệt là các game CPU-bound như CS2, Valorant, và League of Legends. Trong CS2, 7800X3D đạt trung bình 450 FPS ở 1080p, cao hơn i9-14900K khoảng 15-20%.

Công nghệ 3D V-Cache hoạt động bằng cách xếp chồng cache L3 lên trên die, giảm độ trễ truy cập dữ liệu. Điều này đặc biệt hiệu quả với các game có nhiều random access pattern, nơi cache lớn giúp giảm số lần truy cập RAM.

Tuy nhiên, 7800X3D không phải là lựa chọn tốt cho content creation. Với chỉ 8 lõi/16 luồng, nó kém hơn đáng kể so với i9-14900K trong các tác vụ như video editing và rendering. Trong Cinebench R23, 7800X3D chỉ đạt khoảng 18,000 điểm đa lõi, trong khi i9-14900K đạt hơn 38,000 điểm.

Về tiêu thụ điện năng, 7800X3D rất hiệu quả với TDP chỉ 120W, thấp hơn nhiều so với i9-14900K (250W). Điều này giúp giảm nhiệt độ và tiếng ồn hệ thống.

Về giá thành, 7800X3D có giá tương đương i7-14700K nhưng hiệu năng gaming tốt hơn đáng kể. Tuy nhiên, bạn cần mainboard AM5 và RAM DDR5, làm tăng chi phí tổng thể.

Kết luận: Ryzen 7 7800X3D là CPU gaming tốt nhất nếu bạn chỉ chơi game và không làm content creation. Nếu bạn cần cả gaming và content creation, i9-14900K hoặc Ryzen 9 7900X vẫn là lựa chọn tốt hơn.`,
      author: "Trần Minh Quang",
      date: "2024-01-16",
      image: "/images/item_blog/ramddr5.png",
      category: "CPU",
      views: 0,
      readTime: "8 phút"
    },
    {
      id: 10,
      title: "Nguồn máy tính (PSU): Cách chọn công suất và thương hiệu uy tín",
      excerpt: "PSU là trái tim của hệ thống PC. Hướng dẫn chi tiết cách tính công suất cần thiết, chọn hiệu suất (80 Plus), và các thương hiệu PSU đáng tin cậy.",
      content: `Nguồn máy tính (PSU) là một trong những thành phần quan trọng nhất nhưng thường bị bỏ qua khi build PC. Một PSU chất lượng kém có thể làm hỏng toàn bộ hệ thống, trong khi PSU tốt đảm bảo hệ thống hoạt động ổn định và hiệu quả.

Công suất PSU phụ thuộc vào các thành phần trong hệ thống. Với CPU TDP 150W và GPU TDP 300W, bạn cần ít nhất PSU 650W. Tuy nhiên, nên chọn PSU có công suất cao hơn 20-30% để đảm bảo hiệu quả và tuổi thọ. Ví dụ, với RTX 4070 và Ryzen 7 7700X, nên chọn PSU 750W-850W.

Hiệu suất PSU được đánh giá bởi chứng nhận 80 Plus. 80 Plus Bronze có hiệu suất 82-85%, 80 Plus Gold có hiệu suất 87-90%, và 80 Plus Platinum có hiệu suất 90-92%. PSU Gold là điểm cân bằng tốt giữa giá thành và hiệu suất.

Modular PSU cho phép bạn chỉ cắm các dây cần thiết, giúp quản lý cáp tốt hơn và luồng không khí trong case tốt hơn. Fully modular là lý tưởng nhất, nhưng semi-modular (main cables cố định) cũng đủ dùng.

Các thương hiệu PSU uy tín bao gồm Seasonic, Corsair, EVGA, be quiet!, và Cooler Master. Nên tránh các thương hiệu không tên tuổi hoặc PSU giá rẻ quá mức, vì chúng có thể không đảm bảo chất lượng và an toàn.

Bảo hành cũng quan trọng. PSU tốt thường có bảo hành 7-10 năm, cho thấy độ tin cậy của nhà sản xuất. PSU chỉ có bảo hành 1-3 năm thường không đáng tin cậy.

Kết luận: Chọn PSU có công suất cao hơn 20-30% so với nhu cầu thực tế, hiệu suất 80 Plus Gold trở lên, và từ thương hiệu uy tín. Đầu tư vào PSU tốt là đầu tư vào sự ổn định và tuổi thọ của toàn bộ hệ thống.`,
      author: "Lê Thị Hoa",
      date: "2024-01-14",
      image: "/images/item_blog/ssd.png",
      category: "Build",
      views: 0,
      readTime: "6 phút"
    }
  ];
};

// Lấy view count từ localStorage
const getViewCountFromStorage = (id: number): number => {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(`blog_views_${id}`);
  return stored ? parseInt(stored, 10) : 0;
};

// Lưu view count vào localStorage
const saveViewCountToStorage = (id: number, views: number): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`blog_views_${id}`, views.toString());
};

// Tăng view count
export const incrementBlogView = (id: number): number => {
  const currentViews = getViewCountFromStorage(id);
  const newViews = currentViews + 1;
  saveViewCountToStorage(id, newViews);
  return newViews;
};

export const getRelatedPosts = (category: string, excludeId: number, limit: number = 3): BlogPost[] => {
  // Sử dụng getAllBlogPosts để có danh sách đầy đủ (đã loại bỏ blog đã xóa)
  const allPosts = getAllBlogPosts();
  const related = allPosts
    .filter(post => post.category === category && post.id !== excludeId)
    .slice(0, limit);
  
  if (related.length < limit) {
    const otherPosts = allPosts
      .filter(post => post.id !== excludeId && !related.includes(post))
      .slice(0, limit - related.length);
    return [...related, ...otherPosts];
  }
  
  return related;
};

// Lưu blog posts vào localStorage
const saveBlogPostsToStorage = (posts: BlogPost[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('blog_posts', JSON.stringify(posts));
};

// Lấy blog posts từ localStorage
const getBlogPostsFromStorage = (): BlogPost[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('blog_posts');
  return stored ? JSON.parse(stored) : [];
};

// Tạo blog mới
export const createBlog = async (blogData: CreateBlogRequest): Promise<BlogPost> => {
  try {
    // Lấy tất cả blog posts hiện tại (từ raw data và localStorage)
    const existingPosts = getAllBlogPostsRaw();
    const storedPosts = getBlogPostsFromStorage();
    const allPosts = [...existingPosts, ...storedPosts];
    
    // Tạo ID mới (lấy ID lớn nhất + 1)
    const maxId = allPosts.length > 0 
      ? Math.max(...allPosts.map(p => p.id))
      : 0;
    const newId = maxId + 1;
    
    // Xử lý image: nếu là File, tạo URL tạm thời hoặc lưu vào localStorage
    let imageUrl = blogData.image 
      ? URL.createObjectURL(blogData.image) // Tạm thời dùng object URL
      : "/images/item_blog/default.png"; // Default image
    
    // Tạo blog post mới
    const newBlog: BlogPost = {
      id: newId,
      title: blogData.title.trim(),
      excerpt: blogData.excerpt.trim(),
      content: blogData.content.trim(),
      author: blogData.author.trim(),
      date: blogData.date || new Date().toISOString().split('T')[0],
      image: imageUrl,
      category: blogData.category,
      views: 0,
      readTime: blogData.readTime || "5 phút"
    };
    
    // Lưu vào localStorage
    const updatedStoredPosts = [...storedPosts, newBlog];
    saveBlogPostsToStorage(updatedStoredPosts);
    
    return newBlog;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};

// Cập nhật getAllBlogPosts để bao gồm cả posts từ localStorage và loại bỏ blog đã xóa
export const getAllBlogPosts = (): BlogPost[] => {
  const rawPosts = getAllBlogPostsRaw();
  const storedPosts = getBlogPostsFromStorage();
  const deletedIds = getDeletedBlogIds();
  
  // Lọc bỏ blog đã xóa từ raw posts
  const filteredRawPosts = rawPosts.filter(post => !deletedIds.includes(post.id));
  
  // Merge: ưu tiên storedPosts (nếu có cùng ID thì dùng storedPosts)
  const storedPostIds = new Set(storedPosts.map(p => p.id));
  const uniqueRawPosts = filteredRawPosts.filter(post => !storedPostIds.has(post.id));
  const allPosts = [...uniqueRawPosts, ...storedPosts];
  
  return allPosts.map(post => ({
    ...post,
    views: getViewCountFromStorage(post.id)
  }));
};

// Cập nhật getBlogPostById để tìm trong cả localStorage và loại bỏ blog đã xóa
export const getBlogPostById = (id: number): BlogPost | undefined => {
  const deletedIds = getDeletedBlogIds();
  
  // Nếu blog đã bị xóa, return undefined
  if (deletedIds.includes(id)) {
    return undefined;
  }
  
  // Ưu tiên tìm trong storedPosts (blog đã được sửa hoặc tạo mới)
  const storedPosts = getBlogPostsFromStorage();
  let post = storedPosts.find(post => post.id === id);
  
  // Nếu không tìm thấy trong storedPosts, tìm trong rawPosts
  if (!post) {
    const rawPosts = getAllBlogPostsRaw();
    post = rawPosts.find(post => post.id === id);
  }
  
  if (!post) return undefined;
  
  // Merge với view count từ localStorage
  const storedViews = getViewCountFromStorage(id);
  return {
    ...post,
    views: storedViews
  };
};

// Kiểm tra blog có phải do người dùng tạo không (nằm trong localStorage)
export const isUserCreatedBlog = (id: number): boolean => {
  const storedPosts = getBlogPostsFromStorage();
  return storedPosts.some(post => post.id === id);
};

// Cập nhật blog (admin có thể sửa tất cả blog)
export const updateBlog = async (id: number, blogData: UpdateBlogRequest): Promise<BlogPost> => {
  try {
    // Lấy blog cũ từ tất cả nguồn (raw + localStorage)
    const rawPosts = getAllBlogPostsRaw();
    const storedPosts = getBlogPostsFromStorage();
    const allPosts = [...rawPosts, ...storedPosts];
    const oldBlog = allPosts.find(post => post.id === id);
    
    if (!oldBlog) {
      throw new Error('Blog không tồn tại');
    }
    
    // Xử lý image: nếu có file mới thì tạo URL mới, không thì giữ nguyên
    let imageUrl = oldBlog.image; // Giữ nguyên ảnh cũ mặc định
    if (blogData.image) {
      // Nếu có ảnh cũ là object URL, revoke nó
      if (oldBlog.image.startsWith('blob:')) {
        URL.revokeObjectURL(oldBlog.image);
      }
      imageUrl = URL.createObjectURL(blogData.image);
    }
    
    // Tạo blog post đã cập nhật
    const updatedBlog: BlogPost = {
      id: oldBlog.id,
      title: blogData.title.trim(),
      excerpt: blogData.excerpt.trim(),
      content: blogData.content.trim(),
      author: blogData.author.trim(),
      date: blogData.date || oldBlog.date,
      image: imageUrl,
      category: blogData.category,
      views: oldBlog.views, // Giữ nguyên số lượt xem
      readTime: blogData.readTime || calculateReadTime(blogData.content)
    };
    
    // Kiểm tra xem blog đã có trong localStorage chưa
    const storedIndex = storedPosts.findIndex(post => post.id === id);
    if (storedIndex !== -1) {
      // Cập nhật blog đã có trong localStorage
      storedPosts[storedIndex] = updatedBlog;
    } else {
      // Thêm blog mới vào localStorage (override blog mặc định)
      storedPosts.push(updatedBlog);
    }
    
    saveBlogPostsToStorage(storedPosts);
    
    return updatedBlog;
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
};

// Lưu danh sách blog đã xóa vào localStorage
const saveDeletedBlogIds = (ids: number[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('deleted_blog_ids', JSON.stringify(ids));
};

// Lấy danh sách blog đã xóa từ localStorage
const getDeletedBlogIds = (): number[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('deleted_blog_ids');
  return stored ? JSON.parse(stored) : [];
};

// Xóa blog (admin có thể xóa tất cả blog)
export const deleteBlog = async (id: number): Promise<void> => {
  try {
    const storedPosts = getBlogPostsFromStorage();
    const storedIndex = storedPosts.findIndex(post => post.id === id);
    
    // Nếu blog có trong localStorage (do người dùng tạo hoặc đã được admin sửa)
    if (storedIndex !== -1) {
      // Revoke object URL nếu có
      const blogToDelete = storedPosts[storedIndex];
      if (blogToDelete.image.startsWith('blob:')) {
        URL.revokeObjectURL(blogToDelete.image);
      }
      
      // Xóa khỏi mảng
      storedPosts.splice(storedIndex, 1);
      saveBlogPostsToStorage(storedPosts);
    } else {
      // Nếu là blog mặc định, thêm vào danh sách đã xóa
      const deletedIds = getDeletedBlogIds();
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        saveDeletedBlogIds(deletedIds);
      }
    }
    
    // Xóa view count nếu có
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`blog_views_${id}`);
    }
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
};

// Helper function để tính thời gian đọc
const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} phút`;
};

// Lấy danh sách blog do người dùng tạo
export const getUserCreatedBlogs = (): BlogPost[] => {
  const storedPosts = getBlogPostsFromStorage();
  return storedPosts.map(post => ({
    ...post,
    views: getViewCountFromStorage(post.id)
  }));
};

