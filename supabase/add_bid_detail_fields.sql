-- 입찰 참여자 결정에 핵심적인 추가 필드 (g2b API의 dmnd 계열 + 자격·일정)

-- 참여 자격
ALTER TABLE bids ADD COLUMN IF NOT EXISTS bidprc_psbl_indstrty_nm text;  -- 참여 가능 업종
ALTER TABLE bids ADD COLUMN IF NOT EXISTS rgn_lmt_yn text;               -- 지역 제한 여부
ALTER TABLE bids ADD COLUMN IF NOT EXISTS prtcpt_psbl_rgn_nm text;       -- 참가 가능 지역

-- 계약·낙찰 방식
ALTER TABLE bids ADD COLUMN IF NOT EXISTS cntrct_cncls_mthd_nm text;     -- 계약방법 (제한경쟁/일반경쟁/지명경쟁)
ALTER TABLE bids ADD COLUMN IF NOT EXISTS bidwinr_dcsn_mthd_nm text;     -- 낙찰자 결정방법 (적격심사제 등)

-- 일정
ALTER TABLE bids ADD COLUMN IF NOT EXISTS openg_date text;               -- 개찰 일시

-- 수요기관 담당자 (사업 문의용)
ALTER TABLE bids ADD COLUMN IF NOT EXISTS dmnd_instt_ofcl_dept_nm text;
ALTER TABLE bids ADD COLUMN IF NOT EXISTS dmnd_instt_ofcl_nm text;
ALTER TABLE bids ADD COLUMN IF NOT EXISTS dmnd_instt_ofcl_tel text;
ALTER TABLE bids ADD COLUMN IF NOT EXISTS dmnd_instt_ofcl_email_adrs text;
