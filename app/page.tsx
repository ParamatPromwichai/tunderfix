import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Zap,
  Search,
  Wind,
  Cable,
  Droplets,
  Monitor,
  Hammer,
  Smartphone,
  MapPin,
  Clock3,
  Wrench,
  Check,
  MessageSquare,
  Home as HomeIcon,
  UserRound,
} from "lucide-react";
import { Brand } from "@/components/Brand";
import { getHomeDashboard } from "@/services/home.service";
import { getAuthUserFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const icons = [Wind, Cable, Droplets, Monitor, Smartphone, Hammer];
export default async function Home() {
  const [data, user] = await Promise.all([
    getHomeDashboard(),
    getAuthUserFromCookies(),
  ]);
  const base =
    user?.role === "technician"
      ? "/dashboard/technician"
      : "/dashboard/customer";
  const urgent = user
    ? `${base}/urgent`
    : "/login?next=/dashboard/customer/urgent";
  return (
    <div className="landing">
      <a className="skip-link" href="#main">
        ข้ามไปเนื้อหา
      </a>
      <div className="announcement">
        <span>เรื่องเล็ก เรื่องใหญ่ มีช่างช่วยดูแล</span>
        <Link href={urgent}>
          รู้จักบริการเรียกด่วน <ArrowUpRight size={13} />
        </Link>
      </div>
      <header className="landing-header page-width">
        <Brand />
        <nav aria-label="เมนูหลัก">
          <a href="#services">บริการของเรา</a>
          <a href="#how-it-works">เรียกด่วนทำงานอย่างไร</a>
          <Link href="/login?join=technician">สำหรับช่าง</Link>
        </nav>
        <Link href={user ? base : "/login"} className="button dark small">
          {user ? "ไปพื้นที่ของฉัน" : "เข้าสู่ระบบ"}
          <ArrowUpRight size={15} />
        </Link>
      </header>
      <main id="main">
        <section className="home-hero page-width">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="tiny-dot" /> YOUR NEIGHBOURHOOD FIX, SIMPLIFIED.
            </p>
            <h1>
              บ้านมีปัญหา?
              <br />
              <span>ให้ช่างใกล้คุณ</span>
              <br />
              ช่วยจัดการ.
            </h1>
            <p className="hero-description">
              แอร์ไม่เย็น น้ำรั่ว ไฟมีปัญหา ไม่ต้องไล่หาช่างทีละคน
              <br className="desktop-only" /> บอกอาการ
              แล้วเลือกช่างที่พร้อมดูแลคุณ
            </p>
            <Link className="hero-urgent-button" href={urgent}>
              <span className="hero-button-icon">
                <Zap size={24} fill="currentColor" />
              </span>
              <span>
                <strong>เรียกช่างด่วน</strong>
                <small>ส่งประกาศให้ช่างใกล้คุณตอบกลับ</small>
              </span>
              <ArrowUpRight size={25} />
            </Link>
            <p className="hero-alternative">
              อยากเลือกช่างเอง?{" "}
              <Link href={`${base}/explore`}>
                ค้นหาช่างและเปรียบเทียบบริการ <ArrowRight size={14} />
              </Link>
            </p>
            <div className="hero-footnotes">
              <span>
                <Check size={15} /> ดูราคาก่อนเลือกช่าง
              </span>
              <span>
                <Check size={15} /> คุยรายละเอียดผ่านแชต
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-topline">
              <span>THUNDERFIX NOW</span>
              <span>
                <RadioIndicator /> ช่างใกล้คุณ พร้อมช่วย
              </span>
            </div>
            <div
              className="neighbourhood"
              aria-label="ภาพอธิบายการส่งประกาศถึงช่างใกล้คุณ"
            >
              <div className="map-street horizontal street-one" />
              <div className="map-street horizontal street-two" />
              <div className="map-street vertical street-three" />
              <div className="map-street vertical street-four" />
              <div className="map-block block-one" />
              <div className="map-block block-two" />
              <div className="map-block block-three" />
              <div className="map-block block-four" />
              <span className="map-label label-one">พื้นที่ของคุณ</span>
              <span className="map-label label-two">ช่างในบริเวณใกล้เคียง</span>
              <div className="radius-circle radius-outer" />
              <div className="radius-circle radius-inner" />
              <div className="map-center">
                <span>
                  <Zap size={30} fill="currentColor" />
                </span>
                <strong>บ้านคุณ</strong>
              </div>
              <div className="map-tech tech-one">
                <Wrench size={21} />
              </div>
              <div className="map-tech tech-two">
                <Wrench size={21} />
              </div>
              <div className="map-tech tech-three">
                <Wrench size={21} />
              </div>
              <div className="map-tech tech-four">
                <Wrench size={21} />
              </div>
            </div>
            <div className="visual-caption">
              <span className="caption-icon">
                <MessageSquare size={20} />
              </span>
              <div>
                <strong>ประกาศครั้งเดียว ให้ช่างตอบกลับ</strong>
                <p>เลือกจากราคา ระยะทาง และเวลาที่พร้อมมา</p>
              </div>
              <ArrowUpRight size={22} />
            </div>
            <span className="diagram-note">ภาพอธิบายการทำงานของบริการ</span>
          </div>
        </section>
        <section className="service-strip">
          <div className="page-width service-strip-inner">
            <span className="strip-heading">
              เรื่องซ่อมแบบไหน
              <br />
              <strong>เราช่วยหาให้</strong>
            </span>
            {[
              "แอร์และระบบความเย็น",
              "ระบบไฟฟ้า",
              "ระบบประปา",
              "คอมพิวเตอร์",
              "มือถือ",
              "งานบ้านและต่อเติม",
            ].map((name, i) => {
              const Icon = icons[i];
              return (
                <Link
                  key={name}
                  href={`${base}/explore?q=${encodeURIComponent(["แอร์", "ไฟฟ้า", "ประปา", "คอมพิวเตอร์", "มือถือ", "ก่อสร้าง"][i])}`}
                >
                  <Icon size={27} strokeWidth={1.5} />
                  <span>{name}</span>
                  <ArrowUpRight size={13} />
                </Link>
              );
            })}
          </div>
        </section>
        <section id="services" className="page-width home-services">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A LITTLE HELP, A BETTER HOME.</p>
              <h2>เรื่องช่าง เริ่มจากเรื่องของคุณ</h2>
            </div>
            <Link className="text-link" href={`${base}/explore`}>
              ดูบริการทั้งหมด <ArrowRight size={17} />
            </Link>
          </div>
          <div className="service-editorial">
            <Link href={urgent} className="urgent-editorial">
              <div className="editorial-top">
                <span className="eyebrow">01 / NEED HELP NOW</span>
                <Zap size={29} />
              </div>
              <h3>
                เสียตอนนี้
                <br />
                หาช่างตอนนี้
              </h3>
              <p>
                ส่งประกาศงานด่วน พร้อมตำแหน่งและอาการ
                <br />
                ให้ช่างใกล้คุณที่รับบริการนี้ส่งข้อเสนอ
              </p>
              <span className="editorial-link">
                เริ่มเรียกช่างด่วน <ArrowUpRight size={22} />
              </span>
            </Link>
            <div className="planned-editorial">
              <div className="editorial-top">
                <span className="eyebrow">02 / PLAN AHEAD</span>
                <Clock3 size={27} />
              </div>
              <h3>
                งานซ่อมที่วางแผนได้
                <br />
                เลือกให้ตรงใจคุณ
              </h3>
              <p>
                เปรียบเทียบบริการ ประสบการณ์ และราคา
                <br />
                ก่อนนัดหมายในวันที่สะดวก
              </p>
              <form action={`${base}/explore`} className="home-search">
                <Search size={19} />
                <label className="sr-only" htmlFor="home-search">
                  ค้นหาบริการ
                </label>
                <input
                  id="home-search"
                  name="q"
                  placeholder="ลองค้นหา “ล้างแอร์”"
                />
                <button aria-label="ค้นหาช่าง">
                  <ArrowRight size={21} />
                </button>
              </form>
            </div>
          </div>
        </section>
        <section className="how-section" id="how-it-works">
          <div className="page-width how-grid">
            <div>
              <p className="eyebrow orange">LESS SEARCHING. MORE LIVING.</p>
              <h2>
                จากปัญหาตรงหน้า
                <br />
                ถึงช่างที่พร้อมช่วย
              </h2>
              <p className="muted">
                ออกแบบให้เรื่องซ่อมง่ายขึ้น ตั้งแต่เริ่มหาช่าง
                <br />
                จนถึงติดตามงานในที่เดียว
              </p>
              <Link href={urgent} className="button dark">
                ลองเรียกช่างด่วน <ArrowUpRight size={17} />
              </Link>
            </div>
            <ol className="how-steps">
              {[
                {
                  title: "เล่าอาการ แล้วปักหมุด",
                  copy: "เลือกประเภทงาน บอกปัญหาและตำแหน่งที่ต้องการให้ช่างไป",
                },
                {
                  title: "ดูข้อเสนอจากช่างใกล้คุณ",
                  copy: "ช่างที่เปิดรับงานและให้บริการในพื้นที่ ส่งราคาและเวลาที่พร้อมมา",
                },
                {
                  title: "เลือกช่าง คุยให้ชัด แล้วเริ่มงาน",
                  copy: "คุณเป็นคนเลือกช่าง ยืนยันรายละเอียดผ่านแชต และติดตามงานได้",
                },
              ].map((step, i) => (
                <li key={step.title}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.copy}</p>
                  </div>
                  <ArrowUpRight size={21} />
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="page-width home-bottom">
          <div className="partner-invite">
            <span className="eyebrow">THUNDERFIX PARTNER</span>
            <h2>
              ฝีมือของคุณ
              <br />
              ช่วยให้ทุกบ้านดีขึ้นได้
            </h2>
            <p>
              เข้าร่วมเป็นช่างพาร์ทเนอร์ ตั้งบริการและพื้นที่รับงาน
              <br />
              แล้วเริ่มพบกับลูกค้าที่ต้องการคุณ
            </p>
            <Link href="/login?join=technician" className="text-link">
              เริ่มต้นเป็นช่างกับเรา <ArrowUpRight size={19} />
            </Link>
            <Wrench className="partner-watermark" size={140} strokeWidth={1} />
          </div>
          <div className="home-faq">
            <p className="eyebrow">GOOD TO KNOW</p>
            <h2>ก่อนเรียกช่าง</h2>
            <details>
              <summary>ประกาศแล้วจะมีช่างรับทันทีไหม?</summary>
              <p>
                ขึ้นอยู่กับช่างที่เปิดรับงานและตรงประเภทบริการในพื้นที่
                ประกาศเปิดรับข้อเสนอ 30 นาที โดยไม่รับประกันว่าจะมีช่างตอบกลับ
              </p>
            </details>
            <details>
              <summary>ต้องจ่ายเงินตอนลงประกาศไหม?</summary>
              <p>
                ยังไม่มีค่าใช้จ่ายในการลงประกาศ ให้คุยขอบเขตงาน ค่าเดินทาง
                และค่าอะไหล่กับช่างก่อนยืนยันเริ่มงาน
              </p>
            </details>
            <details>
              <summary>เลือกช่างแล้วติดตามงานที่ไหน?</summary>
              <p>
                ดูได้ในเมนูงานซ่อมของฉัน
                และคุยรายละเอียดกับช่างในห้องแชตของงานนั้น
              </p>
            </details>
          </div>
        </section>
        {data.isDatabaseConnected && (
          <div className="page-width platform-count">
            <span>เครือข่ายช่างของเรา</span>
            <strong>
              {data.stats.technicianCount.toLocaleString("th-TH")} ช่างในระบบ
            </strong>
            <span>·</span>
            <strong>
              {data.stats.completedJobs.toLocaleString("th-TH")} งานเสร็จสิ้น
            </strong>
          </div>
        )}
      </main>
      <footer className="landing-footer">
        <div className="page-width">
          <Brand />
          <p>บ้านพร้อม ชีวิตก็พร้อม</p>
          <span>© 2026 ThunderFix</span>
        </div>
      </footer>
      <nav className="public-dock" aria-label="เมนูหลักบนมือถือ">
        <a href="#main" aria-current="page">
          <HomeIcon size={21} />
          <span>หน้าแรก</span>
        </a>
        <a href="#services">
          <Wrench size={21} />
          <span>บริการ</span>
        </a>
        <Link href={urgent} className="public-dock-urgent">
          <Zap size={20} fill="currentColor" />
          <span>เรียกช่างด่วน</span>
        </Link>
        <Link href={user ? base : "/login"}>
          <UserRound size={21} />
          <span>{user ? "บัญชีของฉัน" : "เข้าสู่ระบบ"}</span>
        </Link>
      </nav>
    </div>
  );
}
function RadioIndicator() {
  return <span className="tiny-dot" />;
}
