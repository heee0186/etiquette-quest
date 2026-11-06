(() => {
    // ############################################################
    //  우리 반 예절 실천 퀘스트 - 프로그램 파일 (app.js)
    //
    //  [자주 고치는 곳 - 파일 위쪽에 모여 있어요]
    //   1. 이모지·이름·설명 바꾸기 → 아래 "1. 쉬운 수정 영역" (BADGES, STAGES, STAGE_EVENTS, SHOP 등)
    //   2. 기본 숫자(포인트, 확률, 가격) → "2. 처음 기본값" 안의 settings
    //   3. 글씨 크기·색·간격 → style.css (구역별로 나뉘어 있어요)
    //   4. 화면에 보이는 글자(제목 등) → index.html
    //
    //  [중요] 이 앱은 설정값을 브라우저에 저장해요. 2번 기본값을 바꿔도
    //         이미 쓰던 기기에서는 저장된 값이 우선이에요.
    //         → 교사 설정 화면에서 바꾸거나, "전체 초기화" 후 확인하세요.
    //         (이모지·STAGES·SHOP 이름/설명 같은 1번 영역은 바로 반영돼요.
    //          단, SHOP 가격은 저장된 shopPrices 값이 우선이에요.)
    // ############################################################

    // ============================================================
    // 1. 쉬운 수정 영역 (이모지·이름·설명)
    // ============================================================
    // 저장 이름: 바꾸면 기존 저장 데이터가 사라진 것처럼 보이니 그대로 두세요
    const STORAGE = 'class_adventure_v2_9_q43';
    // 클라우드 저장 (Supabase): 7월 버전(v1)과 같은 프로젝트·같은 교사 계정을 쓰고, 표만 따로 써요
    //  → 처음 한 번 Supabase에서 supabase_v2.sql을 실행해 표를 만들어야 해요
    const SUPABASE_URL = 'https://wlrenrjgwqefumsenihc.supabase.co';
    const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_cLjOP5RHJNzS5fJlGaA9TA_Heu3DNKS';
    const CLOUD_TABLE = 'etiquette_quest_v2_state';
    // 다른 기기의 변경사항을 확인하는 간격(밀리초). 15000 = 15초
    const CLOUD_POLL_MS = 15000;
    const APP_MARK = 'etiquette-quest-2';
    const ICON_ASSETS = {
        merchant: 'images/icon-merchant.png',
        telescope: 'images/icon-telescope.png',
        key: 'images/icon-key.png',
        chest: 'images/icon-chest.png',
        emptychest: 'images/icon-chest-empty.png',
        question: 'images/icon-question.png',
        mysterymerchant: 'images/icon-mystery-merchant.png',
        backpack: 'images/icon-backpack.png'
    };
    const iconHTML = (name, cls = 'sm') => ICON_ASSETS[name] ? `<img src="${ICON_ASSETS[name]}" alt="" class="app-icon ${cls}">` : '';
    // 학생 좌석 색깔
    const COLORS = ['#f58aa5', '#f5cd6c', '#7db7f5', '#b69be8', '#95ce70', '#f38c84', '#f0a85c', '#8eb9f3', '#79c7bd'];
    // 배지 (이모지·이름·설명)
    const BADGES = {
        first: { icon: '🌱', name: '첫출발', desc: '처음으로 오늘의 기록을 남겼어요.' },
        steady: { icon: '🧭', name: '꾸준한 기록', desc: '우리 반이 기록한 날 중 3번 연속으로 기록을 남겼어요.' },
        voice: { icon: '🎤', name: '용기 있는 목소리', desc: '수업에서 자신의 생각을 표현했어요.' },
        listen: { icon: '👂', name: '경청하는 귀', desc: '수업시간에 선생님 말씀을 잘 들었어요.' },
        together: { icon: '🤝', name: '함께하는 손', desc: '친구와 함께 활동에 참여했어요.' },
        retry: { icon: '🔁', name: '다시 해보기', desc: '어려운 활동을 다시 시도했어요.' }
    };
    /*아래 숫자를 수정하면 구간별 칸이 달라짐*/
    // 모험 구간: step 숫자를 바꾸면 구간이 시작되는 칸이 달라져요
    const STAGES = [{ key: 'start', name: '출발지', step: 0 }, { key: 'forest', name: '인사의 숲', step: 10 }, { key: 'bridge', name: '경청의 다리', step: 22 }, { key: 'village', name: '배려의 마을', step: 36 }, { key: 'castle', name: '실천의 성', step: 50 }];
    // 선택의 길 종류 (이모지·문구)
    //  왼쪽 = 늘 같은 칸만큼 가는 '안전한 길', 오른쪽 = 운에 따라 멀리 가거나 조금 가는 '모험 길'
    //  (비용과 칸 수는 교사 설정 > 모험 설정 > 선택의 길 설정에서 바꿔요)
    const CHOICE_PATH_TYPES = [
        { key: 'forest', icon: '🌲', title: '숲속 선택의 길', text: '나무 사이로 두 갈래 길이 나뉘어 있어요.', leftIcon: '🌿', leftName: '잘 닦인 오솔길', rightIcon: '🪨', rightName: '바위가 많은 길', hint: '오솔길은 늘 같은 만큼 갈 수 있고, 바위길은 운이 좋으면 멀리, 나쁘면 조금밖에 못 가요.' },
        { key: 'stream', icon: '💧', title: '시냇가 선택의 길', text: '시냇물 앞에서 길이 두 방향으로 갈라졌어요.', leftIcon: '🛤️', leftName: '튼튼한 작은 다리', rightIcon: '🪵', rightName: '통나무 건너기', hint: '작은 다리는 안전하고, 통나무는 잘 건너면 빠르지만 미끄러질 수도 있어요.' },
        { key: 'hill', icon: '⛰️', title: '언덕길의 선택', text: '앞에 완만한 길과 가파른 길이 보여요.', leftIcon: '🌼', leftName: '꽃밭 완만한 길', rightIcon: '🧗', rightName: '가파른 지름길', hint: '완만한 길은 편안하고, 지름길은 힘들지만 더 멀리 이어질 수도 있어요.' },
        { key: 'cave', icon: '🕯️', title: '동굴 앞 선택의 길', text: '동굴 입구와 밝은 들판길 중 하나를 골라야 해요.', leftIcon: '🏕️', leftName: '밝은 들판길', rightIcon: '🕳️', rightName: '짧아 보이는 동굴길', hint: '들판은 길이 잘 보이고, 동굴은 어디로 이어질지 몰라요.' },
        { key: 'sign', icon: '🪧', title: '낡은 표지판 앞 선택의 길', text: '낡은 표지판이 서로 다른 방향을 가리키고 있어요.', leftIcon: '🍃', leftName: '바람이 부는 길', rightIcon: '⭐', rightName: '별 표시가 있는 길', hint: '바람길은 무난해 보이고, 별 표시 길은 수상해요. 안내지도가 있다면 힌트를 얻을 수 있어요.' }
    ];
    // 구간 도착 시 나오는 관문 활동 문구
    const STAGE_EVENTS = {
        forest: { icon: '🌳', title: '인사의 숲 관문', text: '우리 반이 오늘 가장 먼저 실천할 <b>인사 한마디</b>를 정해서 다 같이 한 번 말해보세요.', button: '인사 완료!' },
        bridge: { icon: '🛤️', title: '경청의 다리 관문', text: '선생님이 짧은 문장을 <b>한 번만</b> 읽어주세요. 모두 잘 듣고, 한 명이 기억나는 내용을 말해보세요.', button: '경청 완료!' },
        village: { icon: '🏘️', title: '배려의 마을 관문', text: '지금 이 자리에서 친구에게 해줄 수 있는 <b>작은 배려 한 가지</b>를 반에서 정해보세요.', button: '배려 완료!' },
        castle: { icon: '🕌', title: '실천의 성 마지막 관문', text: '이번 모험에서 우리 반이 가장 잘 실천했다고 생각하는 <b>예절 한 가지</b>를 함께 골라 말해보세요.', button: '모험 완료!' }
    };
    // ------------------------------------------------------------
    // 관문 예절 퀴즈: 구간(forest·bridge·village·castle)에 도착하면 아래 문제 중 하나가 랜덤으로 나와요
    //  ★ 이제 교사 관리 > '관문 퀴즈' 화면에서 문제를 직접 고치고 추가할 수 있어요.
    //    아래 내용은 '처음 기본 문제'예요. 화면에서 저장한 문제가 있으면 그쪽이 우선이에요.
    //  - q: 문제 / choices: 보기(2~4개) / answer: 정답 번호(0부터, 첫 번째 보기=0) / explain: 해설
    //  - 보기는 화면에서 순서가 섞여요. 구간에 문제가 하나도 없으면 아래 STAGE_EVENTS 활동이 나와요
    //  - 맞히면 보너스 포인트(기본 QUIZ_BONUS)를 받아요. 틀려도 감점은 없고 해설만 보여줘요
    // ------------------------------------------------------------
    const QUIZ_BONUS = 5;
    const QUIZZES = {
        forest: [
            { q: '복도에서 선생님을 만났어요. 가장 알맞은 인사는 무엇일까요?', choices: ['눈을 마주치고 밝게 "안녕하세요!" 하고 인사한다', '못 본 척하고 빠르게 지나간다', '손만 대충 흔들고 지나간다'], answer: 0, explain: '눈을 마주치고 밝은 목소리로 인사하면 받는 사람도 기분이 좋아져요.' },
            { q: '아침에 교실에 들어왔어요. 친구들에게 어떻게 하면 좋을까요?', choices: ['아무 말 없이 자리에 앉는다', '"안녕! 좋은 아침이야!" 하고 먼저 인사한다', '가방 정리만 한다'], answer: 1, explain: '먼저 인사하면 하루가 더 즐거운 분위기로 시작돼요.' },
            { q: '친구가 작은 목소리로 인사했어요. 잘 못 들었다면 어떻게 할까요?', choices: ['못 들은 척한다', '"목소리가 너무 작아!" 하고 말한다', '웃으며 "안녕!" 하고 같이 인사한다'], answer: 2, explain: '인사는 주고받는 거예요. 반갑게 인사로 답하면 친구도 마음이 편해져요.' }
        ],
        bridge: [
            { q: '친구가 이야기를 할 때 가장 좋은 태도는 무엇일까요?', choices: ['눈을 보고 고개를 끄덕이며 끝까지 듣는다', '다른 책을 보면서 듣는다', '중간에 내 이야기를 끼워 넣는다'], answer: 0, explain: '잘 듣는 것은 "네 말이 소중해"라고 말해 주는 일이에요.' },
            { q: '선생님 설명이 이해되지 않을 때 알맞은 행동은 무엇일까요?', choices: ['옆 친구와 큰 소리로 이야기한다', '설명이 끝난 뒤 손을 들고 질문한다', '그냥 포기한다'], answer: 1, explain: '설명이 끝난 뒤 손을 들고 질문하면 나도 배우고 다른 친구도 방해받지 않아요.' },
            { q: '친구가 발표 중에 틀린 말을 했어요. 어떻게 할까요?', choices: ['크게 웃는다', '"틀렸어!" 하고 바로 말한다', '끝까지 듣고 부드럽게 내 생각을 말한다'], answer: 2, explain: '끝까지 듣고 부드럽게 이야기하면 서로 배울 수 있어요.' }
        ],
        village: [
            { q: '친구가 연필을 안 가져와서 곤란해하고 있어요. 어떻게 할까요?', choices: ['모른 척한다', '"내 여분 연필 쓸래?" 하고 건넨다', '"왜 안 가져왔어?" 하고 핀잔을 준다'], answer: 1, explain: '곤란한 친구에게 먼저 손을 내밀면 그 마음이 오래 기억돼요.' },
            { q: '복도에서 친구가 무거운 짐을 들고 힘들어 보여요. 어떻게 할까요?', choices: ['"도와줄까?" 하고 물어본다', '바빠서 그냥 지나간다', '구경만 한다'], answer: 0, explain: '"도와줄까?" 하고 먼저 물어보는 작은 말이 큰 힘이 돼요.' },
            { q: '친구가 실수로 내 물건을 떨어뜨렸어요. 어떻게 할까요?', choices: ['"일부러 그랬지?" 하고 화를 낸다', '"괜찮아!" 하고 같이 주워 준다', '아무 말도 안 하고 쳐다본다'], answer: 1, explain: '실수는 누구나 해요. 괜찮다고 말해 주면 친구도 마음이 놓여요.' }
        ],
        castle: [
            { q: '예절은 언제 지키면 가장 좋을까요?', choices: ['선생님이 볼 때만', '누가 보지 않아도 언제나', '시험 볼 때만'], answer: 1, explain: '보는 사람이 없어도 예절을 지키는 것이 진짜 실천이에요.' },
            { q: '약속을 깜빡 잊고 지키지 못했어요. 어떻게 할까요?', choices: ['못 지킨 것을 숨긴다', '사과하고 다음에는 지키려고 노력한다', '다른 친구 탓을 한다'], answer: 1, explain: '솔직하게 사과하고 다시 노력하는 모습이 멋진 사람의 태도예요.' },
            { q: '우리 반 예절 실천을 오래 이어가는 가장 좋은 방법은 무엇일까요?', choices: ['하루만 아주 열심히 한다', '못 지킨 친구를 놀린다', '매일 조금씩 스스로 체크하고 서로 응원한다'], answer: 2, explain: '작은 실천을 매일 이어가고 서로 응원하면 우리 반 모두가 함께 자라요.' }
        ]
    };
    // 성 보물창고: 실천의 성에 도착하면 남은 포인트로 교환할 수 있는 보상이에요 (이모지·이름·설명·가격 자유롭게 수정)
    const CASTLE_SHOP = [
        { key: 'snack', icon: '🍬', name: '간식 교환권', price: 30, desc: '선생님께 보여주면 작은 간식으로 바꿔 줘요.' },
        { key: 'song', icon: '🎵', name: '노래 신청권', price: 20, desc: '수업 끝나기 전에 노래 한 곡을 신청해요.' },
        { key: 'seat', icon: '🪑', name: '자리 선택권', price: 20, desc: '다음 시간에 앉고 싶은 자리를 골라요.' },
        { key: 'early', icon: '⏰', name: '3분 일찍 끝내기', price: 40, desc: '수업을 3분 일찍 마칠 수 있어요.' }
    ];
    // 구간 아이콘
    const STAGE_ICONS = { forest: '🌳', bridge: '🛤️', village: '🏘️', castle: '🕌' };
    // 상점 아이템 (이모지·이름·설명)
    const SHOP = [
        { key: 'map', icon: '🗺️', name: '숲길 안내지도', price: 10, desc: '다음 선택의 길에서 더 유리해 보이는 쪽의 힌트를 얻어요.' },
        { key: 'free', icon: '🎫', name: '쾌속 주행권', price: 8, desc: '원하는 순간 포인트 없이 버스가 1칸 이동해요.' },
        { key: 'telescope', icon: iconHTML('telescope'), name: '앞길 망원경', price: 15, desc: '다음에 발생할 랜덤 이벤트가 무엇인지 미리 확인해요.' },
        { key: 'compass', icon: '🧭', name: '보물 나침반', price: 15, desc: '다음 랜덤 이벤트를 보물상자로 이끌어 줘요.' },
        { key: 'feather', icon: '🪶', name: '가벼운 여행깃털', price: 20, desc: '다음 유료 이동 3회의 비용을 각각 2P씩 줄여 줘요.' }
    ];
    // 화면에 보이는 문구: 여기서 직접 고치면 바로 반영돼요 (설정 화면에서는 바꾸지 않아요)
    const UI_TEXT = {
        className: '학생들 예절 실천',
        headerSubtitle: '실천하는 힘!',
        headline: '나는 오늘 얼마나 예절을 잘 지켰는가?',
        homeDescription: '내가 지키고자 했던 예절을 얼마나 잘 실천했는지 돌아보고, 다른 학생의 바른 행동도 발견해 보세요!',
        goalLabel: '우리의 공동 목표',
        availableLabel: '모은 포인트',
        usedLabel: '사용한 포인트',
        pocketNote: '기록으로 모은 포인트는 다음 수업시간에 우리 반이 함께 사용해요.',
        busTitle: '우리 반 모험 버스',
        busHint: '내 좌석을 눌러 오늘의 기록을 시작해요.',
        targetLabel: '지금까지 모은 포인트',
        prizeLabel: '완주 보상',
        allBonusHint: '오늘 모두 기록하면 보너스',
        allBonusDone: '오늘 전원 기록 완료! 보너스',
        praiseTitle: '칭찬 쪽지함',
        praiseDesc: '친구들이 발견한 좋은 행동이에요. 모험을 떠나기 전에 함께 읽어 봐요.',
        promiseTitle: '우리 반 예절 약속',
    };
    // 홈 화면 '며칠차' 표시: 교사 설정의 시작일·종료일로 자동 계산돼요
    const DAY_LABEL = { prefix: '합숙', before: '활동 시작 전', after: '활동 종료' };
    // 수상한 상인 보상 이모지(간식·쿠폰): 바꾸려면 여기만 고치면 돼요. 그림 아이콘은 바로 아래 ICON_ASSETS(images 폴더)
    const MYSTERY_ICONS = { snack: '🍪', coupon: '⏱️' };
    // 보물상자 보상 기본 켜짐/꺼짐
    const DEFAULT_REWARDS = { early: true, note: true, present: true, snack: true, free: true, empty: true };
    // 오늘의 기록: '적고 싶은 이야기'의 최소 글자 수 (띄어쓰기는 세지 않아요)
    const STORY_MIN_LENGTH = 10;
    // 칭찬 쪽지: '어떤 행동이었나요?'의 최소 글자 수 (띄어쓰기는 세지 않아요)
    const PRAISE_MIN_LENGTH = 5;
    // 칭찬 쪽지함(모험 지도 화면)에서 처음 보여줄 기간: 최근 며칠 동안의 쪽지
    const PRAISE_RECENT_DAYS = 3;
    // 우리 반 예절 약속: 실천의 성에 도착하면 몇 개까지 적을지
    const PROMISE_COUNT = 3;
    // ============================================================
    // 2. 처음 기본값 (settings 안의 숫자·문구)
    // ============================================================
    // 오늘 날짜 (한국 시간 기준 YYYY-MM-DD)
    function today() {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    // 시작일·종료일을 기준으로 '합숙 1일차' 같은 문구를 자동으로 만들어요
    function dayLabel() {
        const toDay = str => { const [y, m, d] = String(str).split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
        const n = toDay(today()) - toDay(state.settings.startDate) + 1;
        const total = toDay(state.settings.endDate) - toDay(state.settings.startDate) + 1;
        if (!Number.isFinite(n))
            return '';
        if (n < 1)
            return DAY_LABEL.before;
        if (Number.isFinite(total) && total >= 1 && n > total)
            return DAY_LABEL.after;
        return DAY_LABEL.prefix + ' ' + n + '일차';
    }
    function initialState() {
        const names = ['1', '2', '3', '4', '5', '6', '7', '8'];
        return {
            settings: {
                // ── 공동 목표 (교사 설정 화면에서도 바꿀 수 있어요) ──
                goal: '선생님과 어른을 만나면 공손하게 인사합니다',
                // ── 포인트·비밀번호·기간 ──
                recordPoints: 20,
                teacherPin: '0000',
                activeDate: today(),
                startDate: today(),
                endDate: today(),
                targetPoints: 600,
                prizeName: '우리 반 공동 보상',
                // ── 모험 이벤트 수치 (확률은 % 단위) ──
                eventChance: 55,
                baseMoveCost: 10,
                chestCarryExtra: 3,
                // 이벤트가 일어날 확률 (합계 100 이하): 선택의 길·상인·수상한 상인·보물상자·길 위 돌발·생활
                eventProbabilities: { fork: 12, merchant: 12, mysteryMerchant: 8, chest: 10, road: 11, life: 10 },
                // 상인이 나타나기까지 거리(칸)
                merchantDistance: { min: 1, max: 2 },
                // 선택의 길: 왼쪽(안전한 길)/오른쪽(모험 길)의 비용(P)과 이동 칸 수
                //  1칸당 평균 비용이 기본 이동비(10P)보다 싸면 선택의 길이 '지름길'이 되어 모험이 빨라져요
                //  왼쪽 20P→늘 2칸(1칸당 10P), 오른쪽 30P→1~5칸(평균 3칸, 1칸당 10P)
                forkSettings: { leftCost: 20, leftMin: 2, leftMax: 2, rightCost: 30, rightMin: 1, rightMax: 5 },
                // 상점 아이템 가격(P)
                shopPrices: { map: 10, free: 8, telescope: 15, compass: 15, feather: 20 },
                // 수상한 상인: 좋은 상품이 나올 확률(%)
                mysteryMerchantSettings: { goodChances: { 10: 40, 20: 55, 30: 70, 40: 80 } },
                // 길 위 돌발사건: 잃는 포인트 / 얻는 포인트
                roadSettings: { loss: 10, gain: 5 },
                // 생활 이벤트: 음료 가격 / 이동이 느려질 확률(%)
                lifeSettings: { drinkCost: 10, slowChance: 50 },
                // 보물상자 보상 종류
                chestRewards: { ...DEFAULT_REWARDS },
                // 그날 참여 학생 전원이 기록을 내면 받는 보너스(P). 0이면 꺼져요
                allSubmitBonus: 20,
                // 관문 퀴즈 정답 보너스(P)
                quizBonus: QUIZ_BONUS,
                // 관문 퀴즈: null이면 위의 QUIZZES(기본 문제)를 써요. 교사 화면에서 저장하면 여기에 들어가요
                quizzes: null
            },
            // 전원 제출 보너스를 받은 날짜 { '2027-01-05': 20 }
            bonusDays: {},
            // 실천의 성에서 정한 우리 반 예절 약속
            promises: [],
            bank: { earned: 0, used: 0, temp: 0, usage: [] }, adventure: { step: 0, pendingMerchantDistance: 0, merchantPending: false, forkPending: false, slowNextMove: false, carryingChest: false, mapArmed: false, previewEvent: '', compassArmed: false, featherMoves: 0, inventory: { key: 0, map: 0, free: 0, telescope: 0, compass: 0, feather: 0 } },
            students: Array.from({ length: 8 }, (_, i) => ({ id: 's' + (i + 1), name: names[i], pin: '1234', color: COLORS[i], seat: i + 1, active: true, records: 0, badges: [], pendingBadges: [], submittedToday: false })),
            records: [], date: today()
        };
    }
    function normalize(raw) {
        const base = initialState(), x = raw && typeof raw === 'object' ? raw : {};
        const rawSettings = x.settings || {}, rawMystery = rawSettings.mysteryMerchantSettings || {};
        x.settings = { ...base.settings, ...rawSettings, eventProbabilities: { ...base.settings.eventProbabilities, ...(rawSettings.eventProbabilities || {}) }, merchantDistance: { ...base.settings.merchantDistance, ...(rawSettings.merchantDistance || {}) }, forkSettings: { ...base.settings.forkSettings, ...(rawSettings.forkSettings || {}) }, shopPrices: { ...base.settings.shopPrices, ...(rawSettings.shopPrices || {}) }, mysteryMerchantSettings: { ...base.settings.mysteryMerchantSettings, ...rawMystery, goodChances: { ...base.settings.mysteryMerchantSettings.goodChances, ...(rawMystery.goodChances || {}) } }, roadSettings: { ...base.settings.roadSettings, ...(rawSettings.roadSettings || {}) }, lifeSettings: { ...base.settings.lifeSettings, ...(rawSettings.lifeSettings || {}) }, chestRewards: { ...DEFAULT_REWARDS, ...(rawSettings.chestRewards || {}) } };
        delete x.settings.shopPrices.luck;
        // 예전 선택의 길 기본값(1칸당 5P 안팎이라 지름길이 되던 값)을 그대로 쓰고 있었다면 새 기본값으로 바꿔요
        const oldFork = rawSettings.forkSettings;
        if (oldFork && Number(oldFork.leftCost) === 10 && Number(oldFork.leftMin) === 1 && Number(oldFork.leftMax) === 3 && Number(oldFork.rightCost) === 20 && Number(oldFork.rightMin) === 3 && Number(oldFork.rightMax) === 5)
            x.settings.forkSettings = { ...base.settings.forkSettings };
        if (x.settings.quizzes !== null && (typeof x.settings.quizzes !== 'object' || Array.isArray(x.settings.quizzes)))
            x.settings.quizzes = null;
        x.bonusDays = x.bonusDays && typeof x.bonusDays === 'object' && !Array.isArray(x.bonusDays) ? x.bonusDays : {};
        x.promises = Array.isArray(x.promises) ? x.promises.map(p => String(p ?? '').trim()).filter(Boolean) : [];
        if (!rawSettings.eventProbabilities && Number.isFinite(Number(rawSettings.eventChance))) {
            const factor = Math.max(0, Number(rawSettings.eventChance)) / 55;
            Object.keys(base.settings.eventProbabilities).forEach(k => x.settings.eventProbabilities[k] = Math.round(base.settings.eventProbabilities[k] * factor * 10) / 10);
        }
        x.bank = { ...base.bank, ...(x.bank || {}) };
        if (!Array.isArray(x.bank.usage))
            x.bank.usage = [];
        if (x.bank.usage.length === 0 && Number(x.bank.used || 0) > 0) {
            x.bank.usage = [{ id: 'legacy-' + Date.now(), icon: '🧾', title: '이전 사용 포인트', detail: '사용내역 기록 기능 적용 전 사용분', amount: Number(x.bank.used || 0), createdAt: new Date().toISOString() }];
        }
        x.adventure = { ...base.adventure, ...(x.adventure || {}), inventory: { ...base.adventure.inventory, ...(x.adventure?.inventory || {}) } };
        // 열쇠: 예전에는 '오늘의 열쇠 있음/없음'만 저장했어요. 이제는 개수(inventory.key)로 모아요
        x.adventure.inventory.key = Math.max(0, Math.floor(Number(x.adventure.inventory.key) || 0));
        if (x.adventure.todayKey === true)
            x.adventure.inventory.key += 1;
        delete x.adventure.todayKey;
        delete x.adventure.rerollArmed;
        delete x.adventure.inventory.luck;
        const oldStudents = Array.isArray(x.students) ? x.students : base.students;
        x.students = oldStudents.slice(0, 9).map((s, i) => ({ ...base.students[i % base.students.length], id: s.id || ('s' + (i + 1)), ...s, seat: Number(s.seat) || i + 1, active: s.active !== false, badges: Array.isArray(s.badges) ? s.badges : [], pendingBadges: Array.isArray(s.pendingBadges) ? s.pendingBadges : [] }));
        x.records = Array.isArray(x.records) ? x.records : [];
        x.app = APP_MARK;
        x.date = x.date || today();
        if (x.date !== today()) {
            x.date = today();
            x.students.forEach(s => s.submittedToday = x.records.some(r => r.date === today() && r.studentId === s.id));
        }
        x.students.forEach(s => s.records = x.records.filter(r => r.studentId === s.id).length || Number(s.records) || 0);
        return x;
    }
    // ============================================================
    // 3. 데이터 저장·불러오기 (브라우저 localStorage)
    // ============================================================
    function load() { try {
        const raw = localStorage.getItem(STORAGE);
        return raw ? normalize(JSON.parse(raw)) : initialState();
    }
    catch (e) {
        return initialState();
    } }
    let state = load(), activeStudent = null, pinMode = 'student';
    // 저장: 이 브라우저에 먼저 저장하고, 클라우드에도 올려요
    //  kind = 'other'(일반 변경) / 'record'(학생 기록 제출) / 'local'(날짜 바뀜처럼 이 기기에서만 다시 계산되는 변경)
    function save(kind = 'other') {
        try {
            localStorage.setItem(STORAGE, JSON.stringify(state));
        }
        catch (e) { }
        if (kind === 'local')
            return;
        cloudMeta.dirty = true;
        changeSerial++;
        persistCloud();
        scheduleCloudPush();
    }
    // ============================================================
    // 3-1. 클라우드 저장 (Supabase)
    //  - 교사 계정으로 기기마다 처음 한 번 로그인해요 (7월 버전과 같은 방식)
    //  - 우리 반 전체 데이터가 표의 한 줄에 저장되고, revision 숫자로 누가 먼저 저장했는지 확인해요
    //  - 다른 기기가 먼저 저장했으면: 학생 기록은 자동으로 합치고, 그 밖의 변경은 이 기기 것을 우선해요
    //  - 인터넷이 끊겨도 이 기기에 저장해 두었다가 다시 연결되면 올려요
    // ============================================================
    const CLOUD_META_KEY = STORAGE + '_cloud', BASE_KEY = STORAGE + '_base';
    const readJson = (k, fb) => { try {
        const v = JSON.parse(localStorage.getItem(k));
        return v ?? fb;
    }
    catch (e) {
        return fb;
    } };
    const hadLocalAtStart = localStorage.getItem(STORAGE) !== null;
    // cloudMeta.dirty: 이 기기에 아직 클라우드로 올리지 못한 변경이 있는지
    let cloudMeta = { ownerId: '', email: '', revision: 0, dirty: false, updatedAt: '', ...readJson(CLOUD_META_KEY, {}) };
    if (cloudMeta.otherDirty) {
        cloudMeta.dirty = true;
        delete cloudMeta.otherDirty;
    }
    // cloudBase: 마지막으로 클라우드와 맞춘 내용. 합칠 때 '누가 무엇을 바꿨는지' 비교하는 기준이에요
    let cloudBase = readJson(BASE_KEY, null);
    let changeSerial = 0, sb = null, cloudUser = null, cloudReady = false, cloudBusy = false, cloudTimer = null, cloudConflictRow = null, cloudStatus = 'idle', cloudRetryMs = 700;
    function persistCloud() { try {
        localStorage.setItem(CLOUD_META_KEY, JSON.stringify(cloudMeta));
        localStorage.setItem(BASE_KEY, JSON.stringify(cloudBase));
    }
    catch (e) { } }
    const cloudDirty = () => !!cloudMeta.dirty;
    const CLOUD_STATUS_TEXT = { idle: '☁ 연결 확인 중', syncing: '☁ 저장 중…', synced: '☁ 저장 완료', offline: '☁ 이 기기에 저장됨 (연결되면 올려요)', login: '☁ 로그인 필요', error: '☁ 연결 오류', conflict: '☁ 선택 필요' };
    function setCloudStatus(st) {
        cloudStatus = st;
        const pill = document.getElementById('cloudPill');
        if (pill) {
            pill.textContent = CLOUD_STATUS_TEXT[st] || st;
            pill.className = 'cloud-pill ' + st;
        }
        const info = document.getElementById('cloudInfoStatus');
        if (info)
            info.textContent = CLOUD_STATUS_TEXT[st] || st;
    }
    function scheduleCloudPush(delay, keepStatus = false) {
        if (!cloudReady)
            return;
        if (!keepStatus)
            setCloudStatus(navigator.onLine ? 'syncing' : 'offline');
        clearTimeout(cloudTimer);
        cloudTimer = setTimeout(cloudPush, delay ?? 700);
    }
    async function fetchCloudRow() {
        const { data, error } = await sb.from(CLOUD_TABLE).select('owner_id,state,revision,updated_at').eq('owner_id', cloudUser.id).maybeSingle();
        if (error)
            throw error;
        return data;
    }
    const clone = v => JSON.parse(JSON.stringify(v));
    const cloneState = () => clone({ ...state, app: APP_MARK });
    function writeLocal() { try {
        localStorage.setItem(STORAGE, JSON.stringify(state));
    }
    catch (e) { } persistCloud(); }
    // ---------- 두 기기의 변경 합치기 (3-way merge) ----------
    //  기준(base) 대비 한쪽만 바꿨으면 바뀐 쪽을, 둘 다 바꿨으면:
    //   - 포인트·아이템 개수처럼 '쌓이는 숫자'는 양쪽 변화량을 더해요 (A가 10P 쓰고 B가 20P 쓰면 30P)
    //   - 기록·사용내역·학생처럼 id가 있는 목록은 항목별로 합쳐요 (한쪽에서 지운 것은 지워요)
    //   - 배지처럼 글자 목록은 합집합으로 합쳐요
    //   - 그 밖의 값(설정 등)은 이 기기 값을 써요
    const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const COUNTER_PATHS = ['bank.earned', 'bank.used', 'bank.temp'];
    const isCounter = path => COUNTER_PATHS.includes(path) || path.startsWith('adventure.inventory.');
    function merge3(b, l, s, path = '') {
        if (same(l, b))
            return s;
        if (same(s, b))
            return l;
        // 쌓이는 숫자는 양쪽이 우연히 같은 값이 되어도(둘 다 +20) 변화량을 더해야 해요
        if (typeof l === 'number' && typeof s === 'number' && typeof b === 'number' && isCounter(path))
            return Math.max(0, s + (l - b));
        if (same(l, s) && !(isObj(l) && isObj(s)))
            return l;
        if (isObj(l) && isObj(s)) {
            const bb = isObj(b) ? b : {}, out = {};
            new Set([...Object.keys(s), ...Object.keys(l)]).forEach(k => { const v = merge3(bb[k], l[k], s[k], path ? path + '.' + k : k); if (v !== undefined)
                out[k] = v; });
            return out;
        }
        if (Array.isArray(l) && Array.isArray(s)) {
            const bArr = Array.isArray(b) ? b : [];
            const hasIds = arr => arr.every(x => isObj(x) && x.id != null);
            if (hasIds(l) && hasIds(s) && hasIds(bArr)) {
                const bm = new Map(bArr.map(x => [x.id, x])), lm = new Map(l.map(x => [x.id, x])), sm = new Map(s.map(x => [x.id, x]));
                const order = [...s.map(x => x.id), ...l.map(x => x.id).filter(id => !sm.has(id))];
                return order.filter(id => (lm.has(id) && sm.has(id)) || !bm.has(id)).map(id => lm.has(id) && sm.has(id) ? merge3(bm.get(id), lm.get(id), sm.get(id), path + '[]') : (lm.get(id) || sm.get(id)));
            }
            const prim = arr => arr.every(x => x === null || typeof x !== 'object');
            if (prim(l) && prim(s) && prim(bArr)) {
                const removed = new Set([...bArr.filter(x => !l.includes(x)), ...bArr.filter(x => !s.includes(x))]);
                return [...new Set([...s, ...l])].filter(x => !removed.has(x));
            }
        }
        return l;
    }
    // 합친 뒤 정리: 같은 학생·같은 날 기록이 둘이면 하나만, 제출 표시·기록 수 다시 계산, 오늘 전원 제출 보너스 확인
    function tidyAfterMerge() {
        const seen = new Set();
        const dupPoints = [];
        state.records = state.records.filter(r => { const k = r.studentId + '|' + r.date; if (seen.has(k)) {
            dupPoints.push(Number(r.points) || 0);
            return false;
        } seen.add(k); return true; });
        dupPoints.forEach(p => state.bank.earned = Math.max(0, state.bank.earned - p));
        state.students.forEach(st => {
            st.records = state.records.filter(r => r.studentId === st.id).length;
            st.submittedToday = state.records.some(r => r.date === today() && r.studentId === st.id);
        });
        checkAllSubmitBonus(today());
    }
    // 클라우드 내용을 그대로 받아요 (이 기기에 올리지 못한 변경이 없을 때)
    function takeServer(row) {
        state = normalize(clone(row.state));
        cloudBase = clone(row.state);
        cloudMeta.revision = Number(row.revision) || 0;
        cloudMeta.updatedAt = row.updated_at || '';
        cloudMeta.dirty = false;
        writeLocal();
        renderAfterCloud();
    }
    // 이 기기 변경 + 클라우드 변경을 합쳐요 (이후 합친 내용을 다시 올려요)
    function mergeWithServer(row) {
        const before = state.records.length;
        const merged = merge3(cloudBase ? clone(cloudBase) : {}, cloneState(), clone(row.state));
        state = normalize(merged);
        tidyAfterMerge();
        cloudBase = clone(row.state);
        cloudMeta.revision = Number(row.revision) || 0;
        cloudMeta.dirty = true;
        changeSerial++;
        writeLocal();
        renderAfterCloud();
        const added = state.records.length - before;
        if (added > 0)
            toast(`다른 기기에서 들어온 기록 ${added}개를 합쳤어요.`);
    }
    // 다른 기기 내용을 받았을 때 화면 다시 그리기 (선생님 화면은 입력 중일 수 있어 그대로 둬요)
    function renderAfterCloud() {
        if (typeof renderTop !== 'function' || !document.getElementById('homeView'))
            return;
        renderTop();
        renderBus();
        renderAdventure();
        renderCastleShop();
        renderPromiseCard();
        renderPraiseBoard();
    }
    async function cloudPush() {
        if (!cloudReady || cloudBusy || !cloudDirty())
            return;
        if (!navigator.onLine) {
            setCloudStatus('offline');
            return;
        }
        cloudBusy = true;
        const serialAtStart = changeSerial, snapshot = cloneState();
        let retry = false, failed = false;
        try {
            const next = (Number(cloudMeta.revision) || 0) + 1;
            const { data, error } = await sb.from(CLOUD_TABLE).update({ state: snapshot, revision: next }).eq('owner_id', cloudUser.id).eq('revision', cloudMeta.revision).select('revision,updated_at').maybeSingle();
            if (error)
                throw error;
            if (!data) {
                // 다른 기기가 먼저 저장했어요 → 합친 뒤 다시 올려요
                const row = await fetchCloudRow();
                if (!row)
                    await createCloudRow();
                else
                    mergeWithServer(row);
                retry = true;
            }
            else {
                cloudMeta.revision = Number(data.revision) || next;
                cloudMeta.updatedAt = data.updated_at || new Date().toISOString();
                cloudBase = snapshot;
                if (changeSerial === serialAtStart)
                    cloudMeta.dirty = false;
                persistCloud();
                cloudRetryMs = 700;
                setCloudStatus(cloudDirty() ? 'syncing' : 'synced');
                renderCloudInfo();
            }
        }
        catch (err) {
            console.warn('클라우드 저장 실패', err);
            failed = true;
            setCloudStatus('offline');
            cloudRetryMs = 10000;
        }
        finally {
            cloudBusy = false;
            if (cloudDirty() && cloudReady)
                scheduleCloudPush(retry ? 0 : cloudRetryMs, failed);
        }
    }
    async function createCloudRow() {
        const snapshot = cloneState();
        const { data, error } = await sb.from(CLOUD_TABLE).insert({ owner_id: cloudUser.id, state: snapshot, revision: 1 }).select('revision,updated_at').single();
        if (error)
            throw error;
        cloudMeta = { ...cloudMeta, ownerId: cloudUser.id, email: cloudUser.email || '', revision: Number(data.revision) || 1, updatedAt: data.updated_at || '', dirty: false };
        cloudBase = snapshot;
        persistCloud();
    }
    function cloudGate(panel, message = '') {
        const gate = document.getElementById('cloudGate');
        if (!gate)
            return;
        gate.classList.toggle('hidden', !panel);
        ['cloudLoginPanel', 'cloudLoadingPanel', 'cloudConflictPanel'].forEach(id => document.getElementById(id)?.classList.toggle('hidden', id !== panel));
        if (panel === 'cloudLoginPanel')
            document.getElementById('cloudLoginError').textContent = message;
        if (panel === 'cloudConflictPanel')
            document.getElementById('cloudConflictText').textContent = message;
    }
    // 의미 있는 데이터가 이 기기에 있는지 (처음 연결할 때 클라우드 내용과 바꿔도 되는지 판단)
    const localHasData = () => hadLocalAtStart && (state.records.length > 0 || state.adventure.step > 0 || Number(state.bank.used) > 0);
    async function cloudBootstrap() {
        setCloudStatus('syncing');
        try {
            const row = await fetchCloudRow();
            if (row && row.state && row.state.app && row.state.app !== APP_MARK) {
                cloudGate('cloudLoginPanel', '이 계정의 클라우드 표에 다른 형식의 데이터가 있어요. 설정의 CLOUD_TABLE 이름을 확인해 주세요.');
                setCloudStatus('error');
                return;
            }
            if (!row) {
                await createCloudRow();
            }
            else if (cloudMeta.ownerId === cloudUser.id) {
                // 이 기기는 전에 이 계정으로 저장한 적이 있어요
                if (Number(row.revision) !== Number(cloudMeta.revision)) {
                    if (cloudDirty())
                        mergeWithServer(row);
                    else
                        takeServer(row);
                }
            }
            else if (localHasData()) {
                // 처음 연결하는 기기인데 이미 쓰던 내용이 있어요 → 선생님이 고르게 해요
                cloudConflictRow = row;
                cloudGate('cloudConflictPanel', `클라우드에는 기록 ${(row.state?.records || []).length}개, 이 기기에는 기록 ${state.records.length}개가 있어요. 어느 쪽을 쓸까요?`);
                setCloudStatus('conflict');
                return;
            }
            else {
                cloudMeta = { ...cloudMeta, ownerId: cloudUser.id, email: cloudUser.email || '' };
                takeServer(row);
            }
            cloudMeta.ownerId = cloudUser.id;
            cloudMeta.email = cloudUser.email || cloudMeta.email;
            persistCloud();
            cloudReady = true;
            cloudGate(null);
            setCloudStatus(cloudDirty() ? 'syncing' : 'synced');
            if (cloudDirty())
                scheduleCloudPush(0);
            renderCloudInfo();
        }
        catch (err) {
            console.warn('클라우드 확인 실패', err);
            cloudReady = false;
            if (cloudMeta.ownerId) {
                // 전에 연결했던 기기는 계속 쓸 수 있게 두고, 나중에 다시 시도해요
                cloudGate(null);
                setCloudStatus('offline');
            }
            else {
                cloudGate('cloudLoginPanel', `클라우드에 연결하지 못했어요: ${err.message || err}`);
                setCloudStatus('error');
            }
        }
    }
    async function cloudPoll() {
        if (!sb || !cloudUser || cloudBusy || !navigator.onLine || cloudConflictRow)
            return;
        if (!cloudReady)
            return cloudBootstrap();
        if (cloudDirty())
            return cloudPush();
        try {
            const row = await fetchCloudRow();
            if (row && Number(row.revision) > Number(cloudMeta.revision) && !cloudDirty() && !cloudBusy)
                takeServer(row);
            setCloudStatus('synced');
        }
        catch (err) {
            setCloudStatus('offline');
        }
    }
    async function cloudLogin() {
        const email = document.getElementById('cloudEmail').value.trim(), password = document.getElementById('cloudPassword').value;
        if (!email || !password) {
            cloudGate('cloudLoginPanel', '이메일과 비밀번호를 모두 입력해 주세요.');
            return;
        }
        const btn = document.getElementById('cloudConnectBtn');
        btn.disabled = true;
        btn.textContent = '연결 중…';
        try {
            const { data, error } = await sb.auth.signInWithPassword({ email, password });
            if (error)
                throw error;
            cloudUser = data.user;
            cloudGate('cloudLoadingPanel');
            await cloudBootstrap();
        }
        catch (err) {
            cloudGate('cloudLoginPanel', err.message === 'Invalid login credentials' ? '이메일 또는 비밀번호가 맞지 않아요.' : (err.message || '연결하지 못했어요.'));
        }
        finally {
            btn.disabled = false;
            btn.textContent = '이 기기 연결';
        }
    }
    async function resolveConflict(useCloud) {
        const row = cloudConflictRow;
        if (!row)
            return;
        if (useCloud) {
            if (!confirm('클라우드 내용을 불러오면 이 기기의 내용은 사라져요. 계속할까요?'))
                return;
            cloudMeta = { ...cloudMeta, ownerId: cloudUser.id, email: cloudUser.email || '' };
            takeServer(row);
        }
        else {
            if (!confirm('이 기기 내용으로 클라우드를 덮어쓸까요? 다른 기기에서 저장한 내용은 사라져요.'))
                return;
            cloudMeta = { ...cloudMeta, ownerId: cloudUser.id, email: cloudUser.email || '', revision: Number(row.revision) || 0, dirty: true };
            cloudBase = clone(row.state);
            changeSerial++;
        }
        cloudConflictRow = null;
        persistCloud();
        cloudReady = true;
        cloudGate(null);
        setCloudStatus(cloudDirty() ? 'syncing' : 'synced');
        if (cloudDirty())
            scheduleCloudPush(0);
        renderCloudInfo();
    }
    async function cloudReloadFromServer() {
        if (!sb || !cloudUser)
            return;
        if (cloudDirty() && !confirm('아직 클라우드에 올라가지 않은 이 기기의 변경이 있어요. 클라우드 내용을 불러오면 이 변경은 사라져요. 계속할까요?'))
            return;
        try {
            const row = await fetchCloudRow();
            if (row) {
                takeServer(row);
                cloudReady = true;
                setCloudStatus('synced');
                toast('클라우드 최신 내용을 불러왔어요.');
                if (!document.getElementById('teacherView').classList.contains('hidden'))
                    renderTeacher();
            }
        }
        catch (err) {
            toast(`불러오지 못했어요: ${err.message || err}`);
        }
    }
    async function cloudDisconnect() {
        if (cloudDirty() && !confirm('아직 클라우드에 올라가지 않은 변경이 있어요. 연결을 끊으면 이 변경은 올라가지 않아요. 계속할까요?'))
            return;
        if (!confirm('이 기기의 클라우드 연결을 끊을까요? 클라우드에 저장된 데이터는 지워지지 않아요.'))
            return;
        try {
            await sb.auth.signOut();
        }
        catch (e) { }
        cloudUser = null;
        cloudReady = false;
        cloudMeta = { ownerId: '', email: '', revision: 0, dirty: false, updatedAt: '' };
        cloudBase = null;
        persistCloud();
        showAppView('home');
        cloudGate('cloudLoginPanel');
        setCloudStatus('login');
    }
    function renderCloudInfo() {
        const box = document.getElementById('cloudInfo');
        if (!box)
            return;
        const when = cloudMeta.updatedAt ? new Date(cloudMeta.updatedAt).toLocaleString('ko-KR') : '-';
        box.innerHTML = `<p><b>연결 계정:</b> ${esc(cloudUser?.email || cloudMeta.email || '연결 안 됨')}</p><p><b>상태:</b> <span id="cloudInfoStatus">${CLOUD_STATUS_TEXT[cloudStatus] || ''}</span></p><p><b>마지막 클라우드 저장:</b> ${esc(when)} · 저장 번호 ${Number(cloudMeta.revision) || 0}</p>${cloudDirty() ? '<p><b>아직 올라가지 않은 변경이 있어요.</b> 연결되면 자동으로 올려요.</p>' : ''}`;
    }
    async function initCloud() {
        document.getElementById('cloudConnectBtn').onclick = cloudLogin;
        document.getElementById('cloudPassword').addEventListener('keydown', e => { if (e.key === 'Enter')
            cloudLogin(); });
        document.getElementById('useCloudBtn').onclick = () => resolveConflict(true);
        document.getElementById('useLocalBtn').onclick = () => resolveConflict(false);
        document.getElementById('cloudPill').onclick = () => toast(cloudStatus === 'offline' ? '인터넷이 연결되면 자동으로 클라우드에 올려요.' : (CLOUD_STATUS_TEXT[cloudStatus] || ''));
        if (!window.supabase || typeof window.supabase.createClient !== 'function') {
            if (cloudMeta.ownerId) {
                setCloudStatus('offline');
                return;
            }
            setCloudStatus('error');
            cloudGate('cloudLoginPanel', '클라우드 연결 도구를 불러오지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.');
            return;
        }
        sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
        try {
            const { data, error } = await sb.auth.getSession();
            if (error)
                throw error;
            cloudUser = data.session?.user || null;
        }
        catch (err) {
            cloudUser = null;
        }
        if (!cloudUser) {
            setCloudStatus('login');
            cloudGate('cloudLoginPanel');
            return;
        }
        if (!cloudMeta.ownerId)
            cloudGate('cloudLoadingPanel');
        await cloudBootstrap();
    }
    setInterval(cloudPoll, CLOUD_POLL_MS);
    window.addEventListener('online', cloudPoll);
    window.addEventListener('focus', cloudPoll);
    document.addEventListener('visibilitychange', () => { if (!document.hidden)
        cloudPoll(); });
    // 날짜가 바뀌었는지 확인해요. 페이지를 밤새 켜 두어도 '오늘 제출' 표시가 새 날짜에 맞게 초기화돼요
    function checkNewDay() {
        if (state.date === today())
            return false;
        state = normalize(state);
        save('local');
        return true;
    }
    const $ = id => document.getElementById(id);
    const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
    // ============================================================
    // 4. 포인트 계산·이동 비용
    // ============================================================
    function available() { return Math.max(0, Number(state.bank.earned || 0) + Number(state.bank.temp || 0) - Number(state.bank.used || 0)); }
    function baseMoveCost() { return Math.max(1, Math.floor(Number(state.settings.baseMoveCost) || 10)); }
    function carryMoveCost() { return baseMoveCost() + Math.max(0, Math.floor(Number(state.settings.chestCarryExtra) || 0)); }
    function settingNum(group, key, fallback = 0) { const v = Number(state.settings?.[group]?.[key]); return Number.isFinite(v) ? v : fallback; }
    // eventChance/fork keys are kept internally for backward compatibility with existing localStorage.
    function shopPrice(key, fallback) { return Math.max(0, Math.floor(settingNum('shopPrices', key, fallback))); }
    function currentMoveCost() {
        const normal = state.adventure.carryingChest ? carryMoveCost() : baseMoveCost();
        return state.adventure.featherMoves > 0 ? Math.max(1, normal - 2) : normal;
    }
    function consumeFeatherMove() { if (state.adventure.featherMoves > 0)
        state.adventure.featherMoves--; }
    // ============================================================
    // 5. 모험 이벤트 뽑기 (확률 계산)
    // ============================================================
    function eventLabel(kind) { return ({ fork: '선택의 길', merchant: '길거리 상인', mysteryMerchant: '수상한 상인', chest: '보물상자', road: '길 위 돌발사건', life: '생활형 이벤트' })[kind] || '이벤트'; }
    function availableEventKinds() {
        const p = state.settings.eventProbabilities || {};
        const events = [['fork', Math.max(0, Number(p.fork) || 0)]];
        if (merchantSafeDistances().length)
            events.push(['merchant', Math.max(0, Number(p.merchant) || 0)]);
        events.push(['mysteryMerchant', Math.max(0, Number(p.mysteryMerchant) || 0)]);
        if (!state.adventure.carryingChest)
            events.push(['chest', Math.max(0, Number(p.chest) || 0)]);
        events.push(['road', Math.max(0, Number(p.road) || 0)], ['life', Math.max(0, Number(p.life) || 0)]);
        return events.filter(([, chance]) => chance > 0);
    }
    function weightedEventChoice(events, exclude = '') {
        const pool = events.filter(([k, chance]) => k !== exclude && chance > 0);
        if (!pool.length)
            return '';
        const total = pool.reduce((sum, [, chance]) => sum + chance, 0);
        let roll = Math.random() * total;
        for (const [kind, chance] of pool) {
            roll -= chance;
            if (roll < 0)
                return kind;
        }
        return pool.at(-1)?.[0] || '';
    }
    function triggerAdventureEvent(kind) {
        if (kind === 'fork') {
            state.adventure.forkPending = true;
            save();
            renderAll();
            toast('↗️ 선택의 길이 나타났어요! 길 선택하기 버튼을 눌러 보세요.');
            return true;
        }
        if (kind === 'merchant')
            return showMerchantSighting();
        if (kind === 'mysteryMerchant') {
            showMysteryMerchant();
            return true;
        }
        if (kind === 'chest') {
            showChest();
            return true;
        }
        if (kind === 'road') {
            showRoadEvent();
            return true;
        }
        if (kind === 'life') {
            showLifeEvent();
            return true;
        }
        return false;
    }
    function spendPoints(amount, icon, title, detail = '') {
        amount = Math.max(0, Number(amount) || 0);
        if (!amount)
            return;
        state.bank.used = Number(state.bank.used || 0) + amount;
        if (!Array.isArray(state.bank.usage))
            state.bank.usage = [];
        state.bank.usage.unshift({ id: 'u' + Date.now() + Math.random().toString(36).slice(2, 6), icon: icon || '🧾', title: title || '포인트 사용', detail: detail || '', amount, createdAt: new Date().toISOString() });
        if (state.bank.usage.length > 60)
            state.bank.usage = state.bank.usage.slice(0, 60);
    }
    function renderUsageHistory() {
        const box = $('usedPlacesList');
        if (!box)
            return;
        const list = Array.isArray(state.bank.usage) ? state.bank.usage : [];
        const groups = [
            { key: 'move', icon: '🚌', label: '이동하기', match: u => u.title === '모험 버스 이동' },
            { key: 'carry', icon: iconHTML('chest', 'xs'), label: '보물상자 운반 이동', match: u => u.title === '보물상자 운반 이동' },
            { key: 'choice', icon: '↗️', label: '선택의 길', match: u => u.title === '선택의 길' || u.title === '갈림길' },
            { key: 'merchant', icon: '🧳', label: '길거리 상인', match: u => u.title === '길 위의 상인' || u.title === '길거리 상인' },
            { key: 'mysteryMerchant', icon: '🔎', label: '수상한 상인', match: u => u.title === '수상한 상인' },
            { key: 'castleShop', icon: '🏰', label: '성 보물창고', match: u => u.title === '성 보물창고' },
            { key: 'life', icon: '🥤', label: '이벤트', match: u => u.title === '이벤트' },
            { key: 'road', icon: '📄', label: '이게 뭐지?', match: u => u.title === '이게 뭐지?' }
        ];
        const known = new Set();
        const summary = groups.map(g => {
            const rows = list.filter(u => g.match(u));
            rows.forEach(u => known.add(u.id));
            return { ...g, count: rows.length, total: rows.reduce((sum, u) => sum + Number(u.amount || 0), 0) };
        });
        const other = list.filter(u => !known.has(u.id));
        if (other.length)
            summary.push({ key: 'other', icon: '🧾', label: '기타 사용', count: other.length, total: other.reduce((sum, u) => sum + Number(u.amount || 0), 0) });
        const usedSummary = summary.filter(g => g.count > 0 && g.total > 0);
        if (!usedSummary.length) {
            box.className = 'used-places-empty';
            box.textContent = '아직 표시할 사용 내역이 없어요.';
            return;
        }
        box.className = 'usage-summary-list';
        box.innerHTML = usedSummary.map(g => `<div class="usage-summary-row"><span class="usage-summary-icon tone-${g.key}">${g.icon}</span><b>${g.label}</b><span class="usage-summary-value">${g.total}P <small>(${g.count}회)</small></span></div>`).join('') + `<div class="usage-summary-total"><span>총 사용</span><strong>${Number(state.bank.used || 0)}P</strong></div>`;
    }
    // ============================================================
    // 6. 공통 도구 (알림 메시지·팝업 열기/닫기·화면 다시 그리기)
    // ============================================================
    function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1700); }
    function modal(id, show = true) { $(id).classList.toggle('hidden', !show); }
    document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => modal(b.dataset.close, false)));
    document.querySelectorAll('.modal-backdrop').forEach(bg => bg.addEventListener('click', e => { if (e.target === bg && bg.id !== 'adventureEventModal')
        bg.classList.add('hidden'); }));
    function renderAll() { checkNewDay(); renderTop(); renderBus(); renderAdventure(); renderCastleShop(); renderPromiseCard(); renderPraiseBoard(); if (!$('teacherView').classList.contains('hidden'))
        renderTeacher(); }
    // 열쇠 개수
    function keyCount() { return Math.max(0, Math.floor(Number(state.adventure.inventory.key) || 0)); }
    // 관문 퀴즈 문제 목록 (교사 화면에서 저장한 문제가 있으면 그것을, 없으면 기본 문제를 써요)
    function quizBank(key) { const q = state.settings.quizzes; return q && Array.isArray(q[key]) ? q[key] : (QUIZZES[key] || []); }
    function quizBonus() { return Math.max(0, Math.floor(Number(state.settings.quizBonus ?? QUIZ_BONUS) || 0)); }
    function allSubmitBonusAmount() { return Math.max(0, Math.floor(Number(state.settings.allSubmitBonus) || 0)); }
    const textLength = s => String(s ?? '').replace(/\s/g, '').length;
    // ============================================================
    // 7. 홈 화면 그리기 (상단·버스 좌석)
    // ============================================================
    function renderTop() {
        $('headerTitle').textContent = UI_TEXT.className;
        $('headerSubtitle').textContent = UI_TEXT.headerSubtitle;
        $('brandName').textContent = UI_TEXT.className;
        $('dayText').textContent = dayLabel();
        $('headlineText').textContent = UI_TEXT.headline;
        $('homeDescription').textContent = UI_TEXT.homeDescription;
        $('goalLabel').textContent = UI_TEXT.goalLabel;
        $('goalText').textContent = state.settings.goal;
        $('availableLabel').textContent = UI_TEXT.availableLabel;
        $('usedLabel').textContent = UI_TEXT.usedLabel;
        $('pocketNote').textContent = UI_TEXT.pocketNote;
        $('busTitle').textContent = UI_TEXT.busTitle;
        $('busHint').textContent = UI_TEXT.busHint;
        $('homeAvailable').textContent = available();
        $('homeUsed').textContent = state.bank.used;
        $('adventureAvailable').textContent = available();
        renderUsageHistory();
        const active = state.students.filter(s => s.active !== false), done = active.filter(s => s.submittedToday).length;
        $('submitCountText').textContent = `${done}명 / ${active.length}명`;
        // 전원 제출 보너스 안내
        const bonusBox = $('allBonusText'), bonus = allSubmitBonusAmount();
        if (bonusBox) {
            const got = Number(state.bonusDays[today()]) || 0;
            bonusBox.classList.toggle('hidden', !bonus && !got);
            bonusBox.classList.toggle('done', !!got);
            bonusBox.textContent = got ? `🎉 ${UI_TEXT.allBonusDone} +${got}P` : `🤝 ${UI_TEXT.allBonusHint} +${bonus}P`;
        }
        // 완주 목표·공동 보상
        const target = Math.max(1, Number(state.settings.targetPoints) || 1), earned = Math.max(0, Number(state.bank.earned) || 0);
        $('targetLabel').textContent = UI_TEXT.targetLabel;
        $('targetText').textContent = `${earned} / ${target}P`;
        $('targetFill').style.width = Math.min(100, earned / target * 100) + '%';
        $('prizeLabel').textContent = UI_TEXT.prizeLabel;
        $('prizeText').textContent = state.settings.prizeName || '';
    }
    function renderBus() {
        const cabin = $('busCabin');
        cabin.innerHTML = '';
        const pos = { 1: [0, 0], 2: [34.75, 0], 3: [69.5, 0], 4: [0, 34.75], 5: [34.75, 34.75], 6: [69.5, 34.75], 7: [0, 69.5], 8: [34.75, 69.5], 9: [69.5, 69.5] };
        const bySeat = new Map(state.students.filter(s => s.active !== false).map(s => [Number(s.seat), s]));
        for (let n = 1; n <= 9; n++) {
            const [left, top] = pos[n], s = bySeat.get(n);
            const seat = document.createElement(s ? 'button' : 'div');
            seat.className = 'bus-seat' + (s?.submittedToday ? ' submitted' : '') + (s ? '' : ' empty');
            seat.style.left = left + '%';
            seat.style.top = top + '%';
            if (s) {
                seat.type = 'button';
                seat.style.background = s.color;
                seat.innerHTML = `<span class="seat-no">${n}</span><span class="seat-name">${esc(s.name)}</span>`;
                seat.addEventListener('click', () => openPin(s.id));
            }
            else
                seat.innerHTML = `<span class="seat-no">${n}</span><span class="seat-name">빈자리</span>`;
            cabin.appendChild(seat);
        }
    }
    // ============================================================
    // 8. 학생 기록 입력·제출
    // ============================================================
    function openPin(id) { if (checkNewDay())
        renderAll(); activeStudent = id; pinMode = 'student'; const s = state.students.find(x => x.id === id); if (!s || s.active === false)
        return; $('pinStudentName').textContent = s.name; $('pinInput').value = ''; modal('pinModal', true); setTimeout(() => $('pinInput').focus(), 80); }
    $('pinConfirm').addEventListener('click', () => { const s = state.students.find(x => x.id === activeStudent); if (!s)
        return; if ($('pinInput').value !== s.pin) {
        toast('비밀번호가 맞지 않아요.');
        return;
    } modal('pinModal', false); openRecord(s.id); });
    $('pinInput').addEventListener('keydown', e => { if (e.key === 'Enter')
        $('pinConfirm').click(); });
    function visibleBadges(s) { return s.badges.filter(k => BADGES[k]); }
    function openRecord(id) {
        const s = state.students.find(x => x.id === id);
        activeStudent = id;
        const donePills = state.students.filter(x => x.active !== false).map(x => `<span class="student-pill ${x.submittedToday ? 'done' : ''}"><i class="color-dot" style="background:${x.color};width:8px;height:8px"></i>${esc(x.name)} ${x.submittedToday ? '✓' : ''}</span>`).join('');
        const badges = visibleBadges(s).map(k => `<div class="badge"><span class="badge-icon">${BADGES[k].icon}</span>${BADGES[k].name}</div>`).join('') || '<div class="empty-badges">아직 모은 배지가 없어요.</div>';
        // 칭찬 쪽지: 누구의 좋은 행동이었는지 (자기 자신은 빼고)
        const others = state.students.filter(x => x.active !== false && x.id !== s.id).map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('');
        const praiseBox = `<div class="praise-write hidden" id="praiseWrite"><div class="praise-write-title">💌 칭찬 쪽지 쓰기</div><div class="praise-write-row"><label for="praiseTo">누구의 좋은 행동이었나요?</label><select id="praiseTo"><option value="">고르세요</option>${others}<option value="other">다른 사람 (선생님·어른 등)</option></select><input id="praiseOther" class="hidden" maxlength="20" placeholder="누구였는지 적어 주세요"></div><div class="praise-write-row"><label for="praiseText">어떤 행동이었나요?</label><textarea class="story praise-text" id="praiseText" maxlength="200" placeholder="예: 내가 짐을 들고 있을 때 문을 잡아 줬어요."></textarea></div><div class="required-note">※ ${PRAISE_MIN_LENGTH}글자 이상 적어 주세요. 쪽지는 쓴 사람 이름 없이 칭찬 쪽지함에 붙어요.</div></div>`;
        // 내가 받은 칭찬 쪽지
        const received = state.records.filter(r => r.praiseToId === s.id && r.praiseText).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
        const receivedHtml = received.length ? received.slice(0, 5).map(r => `<div class="praise-mini"><span>${esc(r.praiseText)}</span><small>${fmtDate(r.date)}</small></div>`).join('') + (received.length > 5 ? `<div class="praise-more">외 ${received.length - 5}개 더 있어요</div>` : '') : '<div class="empty-badges">아직 받은 쪽지가 없어요.</div>';
        $('recordBody').innerHTML = `<div class="record-layout"><div><h2 class="record-title">${esc(s.name)}의 오늘 기록</h2><div class="record-sub">정답을 맞히는 시간이 아니라 오늘 하루를 돌아보는 시간이에요.</div>${question('practice', '오늘 나의 실천을 잘 했나요?', ['잘했어요', '조금 했어요', '다음엔 더 해볼래요'])}${question('goal', '공동의 목표를 잘 지켰나요?', ['잘 지켰어요', '노력했어요', '아쉬웠어요'])}${question('notice', '다른 사람의 좋은 행동을 발견했나요?', ['발견했어요', '조금 봤어요', '오늘은 못 찾았어요'], praiseBox)}<div class="q-card"><h3>적고 싶은 이야기를 써보세요.</h3><textarea class="story" id="storyText" placeholder="오늘 나는 ___을(를) 했다. 왜냐하면 ___. 내일은 ___ 해 보고 싶다."></textarea><div class="required-note" id="storyCount">※ ${STORY_MIN_LENGTH}글자 이상 적어야 제출할 수 있어요. (지금 0글자)</div></div><div class="submit-row"><button class="primary" id="submitRecord">오늘의 기록 제출</button></div></div><aside><div class="side-box"><h3>오늘 친구들의 기록</h3><div class="submission-mini">${donePills}</div></div><div class="side-box"><h3>💌 내가 받은 칭찬 쪽지 <small class="praise-count">${received.length}</small></h3><div class="praise-mini-list">${receivedHtml}</div></div><div class="side-box"><h3>내 배지함</h3><div class="badge-list">${badges}</div></div></aside></div>`;
        document.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
            const g = b.dataset.group;
            document.querySelectorAll(`.choice[data-group="${g}"]`).forEach(x => x.classList.remove('selected'));
            b.classList.add('selected');
            if (g === 'notice')
                $('praiseWrite').classList.toggle('hidden', b.dataset.value === '오늘은 못 찾았어요');
        }));
        $('praiseTo').addEventListener('change', () => $('praiseOther').classList.toggle('hidden', $('praiseTo').value !== 'other'));
        const updateCount = () => { const n = textLength($('storyText').value); const el = $('storyCount'); el.textContent = `※ ${STORY_MIN_LENGTH}글자 이상 적어야 제출할 수 있어요. (지금 ${n}글자)`; el.classList.toggle('ok', n >= STORY_MIN_LENGTH); };
        $('storyText').addEventListener('input', updateCount);
        $('submitRecord').addEventListener('click', submitRecord);
        modal('recordModal', true);
    }
    function question(group, title, choices, extra = '') { return `<div class="q-card"><h3>${title}</h3><div class="choice-row">${choices.map(c => `<button type="button" class="choice" data-group="${group}" data-value="${esc(c)}">${esc(c)}</button>`).join('')}</div>${extra}</div>`; }
    // 우리 반이 기록한 날(누군가 한 명이라도 기록한 날) 중 최근 n번을 이 학생이 모두 기록했는지
    //  → 입력을 못 하는 날(쉬는 날)이 끼어 있어도 연속이 끊기지 않아요
    function hasRecordStreak(studentId, n = 3) {
        const dates = [...new Set(state.records.map(r => r.date))].sort();
        const last = dates.slice(-n);
        return last.length === n && last.every(d => state.records.some(r => r.date === d && r.studentId === studentId));
    }
    // 참여 학생 전원이 그날 기록했으면 보너스를 한 번만 줘요
    function checkAllSubmitBonus(d = today()) {
        const bonus = allSubmitBonusAmount(), active = state.students.filter(s => s.active !== false);
        if (!bonus || !active.length || state.bonusDays[d])
            return 0;
        if (!active.every(s => state.records.some(r => r.date === d && r.studentId === s.id)))
            return 0;
        state.bonusDays[d] = bonus;
        state.bank.earned += bonus;
        return bonus;
    }
    function submitRecord() {
        checkNewDay();
        const s = state.students.find(x => x.id === activeStudent);
        if (!s)
            return;
        const groups = ['practice', 'goal', 'notice'];
        const picked = {};
        for (const g of groups) {
            const el = document.querySelector(`.choice[data-group="${g}"].selected`);
            if (!el) {
                toast('세 가지 질문에 모두 답해 주세요.');
                return;
            }
            picked[g] = el.dataset.value;
        }
        // 칭찬 쪽지 (좋은 행동을 발견했다고 고른 경우)
        let praise = null;
        if (picked.notice !== '오늘은 못 찾았어요') {
            const toVal = $('praiseTo').value, text = $('praiseText').value.trim();
            if (!toVal) {
                toast('누구의 좋은 행동이었는지 골라 주세요.');
                return;
            }
            let toName = '';
            if (toVal === 'other') {
                toName = $('praiseOther').value.trim();
                if (!toName) {
                    toast('누구였는지 적어 주세요.');
                    return;
                }
            }
            else
                toName = state.students.find(x => x.id === toVal)?.name || '';
            if (textLength(text) < PRAISE_MIN_LENGTH) {
                toast(`어떤 행동이었는지 ${PRAISE_MIN_LENGTH}글자 이상 적어 주세요.`);
                return;
            }
            praise = { praiseToId: toVal === 'other' ? '' : toVal, praiseToName: toName, praiseText: text };
        }
        const story = $('storyText').value.trim();
        if (textLength(story) < STORY_MIN_LENGTH) {
            toast(`이야기를 ${STORY_MIN_LENGTH}글자 이상 적어 주세요. (지금 ${textLength(story)}글자)`);
            return;
        }
        if (s.submittedToday || state.records.some(r => r.date === today() && r.studentId === s.id)) {
            toast('오늘 기록은 이미 제출했어요.');
            return;
        }
        const rec = { id: 'r' + Date.now() + Math.random().toString(36).slice(2, 7), date: today(), studentId: s.id, studentName: s.name, practice: picked.practice, goal: picked.goal, notice: picked.notice, ...(praise || {}), story, points: Math.max(0, Number(state.settings.recordPoints) || 0), createdAt: new Date().toISOString() };
        const result = applySubmission(rec);
        if (!result) {
            toast('오늘 기록은 이미 제출했어요.');
            return;
        }
        save('record');
        modal('recordModal', false);
        renderAll();
        animateToBank(result.pts + result.bonus);
        setTimeout(() => showSuccess(result.student, result.newBadges, result.bonus, !!praise), 900);
    }
    // 기록 1개를 상태에 반영해요 (포인트·배지·전원 제출 보너스). 이미 같은 기록이 있으면 null
    //  → 이 기기에서 제출할 때도, 다른 기기 기록을 합칠 때도 같은 함수를 써요
    function applySubmission(rec) {
        const s = state.students.find(x => x.id === rec.studentId);
        if (!s || state.records.some(r => r.id === rec.id || (r.date === rec.date && r.studentId === rec.studentId)))
            return null;
        const pts = Math.max(0, Number(rec.points ?? state.settings.recordPoints) || 0);
        state.records.push({ ...rec, studentName: rec.studentName || s.name, points: pts });
        if (rec.date === today())
            s.submittedToday = true;
        s.records = state.records.filter(r => r.studentId === s.id).length;
        state.bank.earned += pts;
        const newBadges = [];
        if (!s.badges.includes('first')) {
            s.badges.push('first');
            newBadges.push('first');
        }
        if (!s.badges.includes('steady') && hasRecordStreak(s.id, 3)) {
            s.badges.push('steady');
            newBadges.push('steady');
        }
        (s.pendingBadges || []).forEach(k => { if (!s.badges.includes(k)) {
            s.badges.push(k);
            newBadges.push(k);
        } });
        s.pendingBadges = [];
        const bonus = checkAllSubmitBonus(rec.date);
        return { student: s, newBadges, bonus, pts };
    }
    function animateToBank(pts) { const from = { x: window.innerWidth / 2, y: window.innerHeight / 2 }; const target = $('bankTarget').getBoundingClientRect(); for (let i = 0; i < 4; i++) {
        const d = document.createElement('div');
        d.className = 'fly-point';
        d.textContent = '+' + Math.round(pts / 4);
        d.style.left = (from.x - 15 + (i - 1.5) * 16) + 'px';
        d.style.top = (from.y - 15) + 'px';
        document.body.appendChild(d);
        requestAnimationFrame(() => { d.style.left = (target.left + target.width * .35 + i * 18) + 'px'; d.style.top = (target.top + target.height * .46) + 'px'; d.style.transform = 'scale(.55)'; d.style.opacity = '.25'; });
        setTimeout(() => d.remove(), 920);
    } }
    function showSuccess(s, newBadges, bonus = 0, wrotePraise = false) { const b = newBadges.map(k => `<div class="new-badge">${BADGES[k].icon} ${BADGES[k].name}<small>${BADGES[k].desc}</small></div>`).join(''); const bonusHtml = bonus ? `<div class="all-bonus-banner">🎉 오늘 우리 반 <b>모두</b>가 기록을 마쳤어요!<br>함께해서 받은 보너스 <b>+${bonus}P</b></div>` : ''; const praiseHtml = wrotePraise ? `<p class="praise-sent">💌 칭찬 쪽지가 쪽지함에 붙었어요.</p>` : ''; $('successBody').innerHTML = `<div class="success-icon">${iconHTML('backpack', 'lg')}</div><h2>오늘의 기록 완료!</h2><p>우리 반 모험 주머니에 힘을 보탰어요.</p>${praiseHtml}${bonusHtml}${b ? `<div class="new-badges"><b>🎉 새 배지를 얻었어요!</b>${b}</div>` : ''}<div style="margin-top:18px"><button class="primary" id="successClose">확인</button></div>`; $('successClose').onclick = () => modal('successModal', false); modal('successModal', true); }
    // ============================================================
    // 9. 모험 지도 화면 그리기
    // ============================================================
    function currentStageIndex() { let idx = 0; STAGES.forEach((s, i) => { if (state.adventure.step >= s.step)
        idx = i; }); return idx; }
    function stageScene(key) {
        const commonStart = '<svg viewBox="0 0 160 112" preserveAspectRatio="xMidYMid slice" aria-hidden="true">', commonEnd = '</svg>';
        const scenes = {
            start: commonStart + '<defs><linearGradient id="s1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#65c8ff"/><stop offset="1" stop-color="#8c7bff"/></linearGradient></defs><rect width="160" height="90" fill="url(#s1)"/><rect y="90" width="160" height="22" fill="#42b879"/><circle cx="128" cy="21" r="12" fill="#fff4a6" opacity=".9"/><path d="M0 73 Q38 48 75 68 T160 61 V90 H0Z" fill="#42b879"/><path d="M18 72 Q48 49 79 69" fill="none" stroke="#caa675" stroke-width="9" stroke-linecap="round"/><path d="M48 58 V27" stroke="#5a3e31" stroke-width="4"/><path d="M50 28 L78 36 L50 45Z" fill="#087f32"/><circle cx="21" cy="24" r="2" fill="white"/><circle cx="97" cy="15" r="2" fill="white"/>' + commonEnd,
            forest: commonStart + '<defs><linearGradient id="s2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#63d9c0"/><stop offset="1" stop-color="#2b8a67"/></linearGradient></defs><rect width="160" height="90" fill="url(#s2)"/><rect y="90" width="160" height="22" fill="#2b8a67"/><circle cx="30" cy="65" r="25" fill="#1e6f50"/><circle cx="62" cy="55" r="31" fill="#2f9b63"/><circle cx="105" cy="62" r="27" fill="#237e55"/><circle cx="137" cy="53" r="31" fill="#38a868"/><rect x="58" y="54" width="7" height="30" rx="3" fill="#755035"/><rect x="103" y="58" width="7" height="27" rx="3" fill="#755035"/><path d="M4 88 Q42 69 77 85 T156 76" fill="none" stroke="#e7c187" stroke-width="8" stroke-linecap="round"/><circle cx="81" cy="20" r="3" fill="#fff2a7"/><circle cx="121" cy="28" r="2" fill="#fff"/>' + commonEnd,
            bridge: commonStart + '<defs><linearGradient id="s3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7f91ff"/><stop offset="1" stop-color="#4d58c8"/></linearGradient></defs><rect width="160" height="90" fill="url(#s3)"/><rect y="90" width="160" height="22" fill="#40bde0"/><path d="M0 64 Q38 53 74 65 T160 58 V90 H0Z" fill="#40bde0"/><path d="M22 63 Q80 19 139 62" fill="none" stroke="#f2d8aa" stroke-width="11"/><path d="M24 63 Q80 28 137 62" fill="none" stroke="#8e684e" stroke-width="4"/><path d="M35 56 V74 M55 42 V67 M80 34 V61 M105 42 V67 M126 56 V73" stroke="#8e684e" stroke-width="3"/><circle cx="22" cy="18" r="2" fill="#fff"/><circle cx="142" cy="24" r="3" fill="#ffe985"/>' + commonEnd,
            village: commonStart + '<defs><linearGradient id="s4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8edcff"/><stop offset="1" stop-color="#d8f4ff"/></linearGradient></defs><rect width="160" height="90" fill="url(#s4)"/><rect y="90" width="160" height="22" fill="#7fb7e8"/><path d="M0 73 Q42 59 83 73 T160 64 V90 H0Z" fill="#7fb7e8"/><rect x="18" y="47" width="31" height="30" rx="3" fill="#f6e3bd"/><path d="M13 49 L34 31 L55 49Z" fill="#8066d9"/><rect x="30" y="58" width="8" height="19" fill="#785240"/><rect x="61" y="40" width="37" height="37" rx="3" fill="#ffe5aa"/><path d="M56 42 L79 22 L103 42Z" fill="#43a86f"/><rect x="76" y="58" width="9" height="19" fill="#785240"/><rect x="109" y="51" width="29" height="26" rx="3" fill="#f7d8c6"/><path d="M105 52 L123 36 L142 52Z" fill="#438fe8"/>' + commonEnd,
            castle: commonStart + '<defs><linearGradient id="s5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6556d6"/><stop offset="1" stop-color="#2d245f"/></linearGradient></defs><rect width="160" height="90" fill="url(#s5)"/><rect y="90" width="160" height="22" fill="#243e67"/><circle cx="127" cy="19" r="12" fill="#fff1aa"/><circle cx="25" cy="18" r="2" fill="#fff"/><circle cx="53" cy="27" r="2" fill="#fff"/><path d="M0 80 Q38 62 79 77 T160 68 V90 H0Z" fill="#243e67"/><rect x="45" y="35" width="71" height="43" fill="#b9b6e8"/><rect x="34" y="27" width="25" height="51" fill="#d3cff2"/><rect x="103" y="27" width="25" height="51" fill="#d3cff2"/><path d="M34 27 L46 13 L59 27Z M103 27 L115 13 L128 27Z" fill="#9bdfff"/><path d="M45 35 L55 21 L66 35 M93 35 L104 21 L115 35" fill="#8b78df"/><path d="M73 78 V56 Q80 47 88 56 V78Z" fill="#4b3a78"/><rect x="49" y="43" width="10" height="12" rx="4" fill="#6d8ee8"/><rect x="103" y="43" width="10" height="12" rx="4" fill="#6d8ee8"/>' + commonEnd
        };
        return scenes[key] || scenes.start;
    }
    function renderAdventure() {
        const idx = currentStageIndex(), last = STAGES.at(-1), maxStep = Math.max(1, last.step);
        $('adventureAvailable').textContent = available();
        $('stepCount').textContent = state.adventure.step;
        const progress = Math.min(100, state.adventure.step / maxStep * 100);
        $('routeFill').style.width = progress + '%';
        $('routeOrb').style.left = `calc(${progress}% - 1px)`;
        $('routeMetaLeft').textContent = STAGES[idx].name;
        $('routeMetaRight').textContent = `${state.adventure.step} / ${last.step}칸`;
        $('currentLocationText').textContent = `현재 위치 · ${STAGES[idx].name}`;
        const next = STAGES[idx + 1];
        $('nextLocationText').textContent = next ? `다음 장소 · ${next.name}까지 ${Math.max(0, next.step - state.adventure.step)}칸` : '모든 지역을 완료했어요!';
        const keyBtn = $('getTodayKey');
        if (keyBtn)
            keyBtn.innerHTML = `${iconHTML('key', 'xs')} 열쇠 지급`;
        const segHost = $('routeSegments');
        if (segHost)
            segHost.innerHTML = STAGES.slice(1, -1).map(st => `<span class="route-seg" style="left:${(st.step / maxStep) * 100}%"></span>`).join('');
        const items = [];
        SHOP.filter(it => (state.adventure.inventory[it.key] || 0) > 0).forEach(it => {
            const qty = state.adventure.inventory[it.key] || 0;
            let disabled = false, label = '사용';
            if (it.key === 'map') {
                disabled = state.adventure.mapArmed;
                label = state.adventure.mapArmed ? '준비됨' : '다음 선택의 길에 사용';
            }
            if (it.key === 'free') {
                disabled = state.adventure.step >= STAGES.at(-1).step;
                label = '1칸 무료 이동';
            }
            if (it.key === 'telescope') {
                disabled = !!state.adventure.previewEvent;
                label = state.adventure.previewEvent ? '확인 완료' : '앞길 보기';
            }
            if (it.key === 'compass') {
                disabled = state.adventure.compassArmed || state.adventure.carryingChest;
                label = state.adventure.compassArmed ? '작동 중' : '다음 보물상자';
            }
            if (it.key === 'feather') {
                disabled = state.adventure.featherMoves > 0;
                label = state.adventure.featherMoves > 0 ? `할인 ${state.adventure.featherMoves}회` : '3회 할인';
            }
            items.push(`<button class="backpack-item-btn${disabled ? ' active' : ''}" data-backpack-use="${it.key}" ${disabled ? 'disabled' : ''} title="${esc(it.desc)}">${it.icon} ${it.name} <b>${qty}</b><span>· ${label}</span></button>`);
        });
        if (keyCount() > 0)
            items.push(`<span class="backpack-chip backpack-key-chip">${iconHTML('key', 'xs')} 탐험 열쇠 <b>${keyCount()}개</b></span>`);
        if (state.adventure.carryingChest)
            items.push(`<span class="backpack-chip chest-carry-inv">${iconHTML('chest', 'xs')} 상자 운반 중</span>`);
        if (state.adventure.mapArmed)
            items.push(`<span class="backpack-chip active-item-chip">🗺️ 다음 선택의 길 지도 준비</span>`);
        if (state.adventure.previewEvent)
            items.push(`<span class="backpack-chip active-item-chip">${iconHTML('telescope', 'xs')} 다음 이벤트 · ${eventLabel(state.adventure.previewEvent)}</span>`);
        if (state.adventure.compassArmed)
            items.push(`<span class="backpack-chip active-item-chip">🧭 보물 나침반 작동 중</span>`);
        if (state.adventure.featherMoves > 0)
            items.push(`<span class="backpack-chip active-item-chip">🪶 할인 ${state.adventure.featherMoves}회 남음</span>`);
        $('backpackItems').innerHTML = items.length ? items.join('') : '<div class="backpack-empty">아직 배낭에 들어온 아이템이 없어요.</div>';
        setTimeout(() => document.querySelectorAll('[data-backpack-use]').forEach(b => { b.onclick = () => useBackpackItem(b.dataset.backpackUse); }), 0);
        $('levelGrid').innerHTML = STAGES.map((st, i) => { const finalDone = i === STAGES.length - 1 && state.adventure.step >= st.step; const done = state.adventure.step >= st.step && (i < idx || finalDone); const current = i === idx && !done; const cls = done ? 'done' : current ? 'current' : 'locked'; const badge = done ? '<div class="lock-badge done-badge">✦</div>' : current ? '<div class="lock-badge pending-badge"></div>' : '<div class="lock-badge locked-badge">🔒</div>'; return `<div class="level-card ${cls}">${badge}<div class="level-scene">${stageScene(st.key)}</div><div class="level-info"><div class="level-no">STAGE ${String(i + 1).padStart(2, '0')}</div><div class="level-name">${st.name}</div><div class="level-status">${done ? '완료' : current ? '현재 위치' : '잠김'}</div></div></div>`; }).join('');
        const cost = currentMoveCost();
        $('baseMoveCostText').textContent = baseMoveCost();
        const moveBtn = $('moveBtn');
        moveBtn.className = 'primary move-main-btn';
        if (state.adventure.forkPending) {
            moveBtn.innerHTML = '↗️ 길 선택하기';
            moveBtn.classList.add('fork-btn');
        }
        else if (state.adventure.merchantPending) {
            moveBtn.innerHTML = `${iconHTML('merchant', 'xs')} 상인 만나기`;
            moveBtn.classList.add('merchant-btn');
        }
        else {
            moveBtn.innerHTML = state.adventure.carryingChest ? `🚌 ${cost}P 사용 · 1칸 이동 (${iconHTML('chest', 'xs')} 운반 중)` : `🚌 ${cost}P 사용 · 1칸 이동`;
        }
        const status = [];
        if (state.adventure.forkPending)
            status.push('↗️ 선택의 길에서 어느 길로 갈지 선택해야 해요.');
        if (state.adventure.merchantPending)
            status.push('🧳 상인이 도착했어요. 지금 만나볼 수 있어요.');
        else if (state.adventure.pendingMerchantDistance > 0)
            status.push(`🧳 상인까지 ${state.adventure.pendingMerchantDistance}칸`);
        if (state.adventure.slowNextMove)
            status.push('🥤 잠시 쉬어가느라 다음 유료 이동 1회는 제자리예요.');
        if (state.adventure.carryingChest)
            status.push(`${iconHTML('chest', 'xs')} 보물상자를 버스에 싣고 있어 이동비가 ${Math.max(0, Number(state.settings.chestCarryExtra) || 0)}P 더 들어요.`);
        if (state.adventure.mapArmed)
            status.push('🗺️ 다음 선택의 길에서 안내지도가 자동으로 적용돼요.');
        if (state.adventure.featherMoves > 0)
            status.push(`🪶 여행깃털 할인 ${state.adventure.featherMoves}회 남음`);
        if (state.adventure.compassArmed)
            status.push('🧭 다음 랜덤 이벤트는 보물상자예요.');
        $('adventureStatus').innerHTML = status.length ? status.map(t => `<span class="status-item">${t}</span>`).join('') : `<span class="status-item">🚌 ${baseMoveCost()}P를 사용하면 모험 버스가 반드시 1칸 이동합니다.</span>`;
        // 상자를 싣고 가는 중에 열쇠가 있으면 언제든 열 수 있는 버튼 (나중에 열기를 골라도 여기서 열 수 있어요)
        const chestArea = $('chestOpenArea');
        if (chestArea) {
            const canOpen = state.adventure.carryingChest && keyCount() > 0;
            chestArea.innerHTML = canOpen ? `<button class="chest-open-btn" id="openChestNowBtn">${iconHTML('chest', 'xs')} 열쇠로 상자 열기</button>` : '';
            if (canOpen)
                $('openChestNowBtn').onclick = openChest;
        }
        const area = $('itemActionArea');
        if (area)
            area.innerHTML = '';
    }
    // ============================================================
    // 10. 이벤트 팝업 공통 / 관문 도착 / 이동
    // ============================================================
    function showEventPopup(icon, title, html, actions = '') { const box = document.querySelector('#adventureEventModal .adventure-event-modal'); if (box)
        box.classList.remove('merchant-wide'); const iconBox = $('adventureEventIcon'); const iconText = String(icon ?? ''); if (iconText.trim().startsWith('<'))
        iconBox.innerHTML = iconText;
    else
        iconBox.textContent = iconText; $('adventureEventTitle').textContent = title; $('adventureEventText').innerHTML = html; $('adventureEventActions').innerHTML = actions; modal('adventureEventModal', true); }
    function closeEventPopup() { modal('adventureEventModal', false); }
    function eventOkButton(label = '계속 가기') { return `<button class="primary" id="eventOkBtn">${label}</button>`; }
    function bindEventOk(fn = closeEventPopup) { setTimeout(() => { const b = $('eventOkBtn'); if (b)
        b.onclick = fn; }, 0); }
    function fireStageCelebration() {
        const layer = document.createElement('div');
        layer.className = 'stage-celebration-layer';
        const colors = ['#ffcf4a', '#ff7b7b', '#6ed5ff', '#8fe388', '#b99cff', '#ff9ed2'];
        [18, 82].forEach(left => { for (let i = 0; i < 30; i++) {
            const p = document.createElement('i');
            p.className = 'stage-confetti';
            p.style.left = left + '%';
            p.style.top = (43 + Math.random() * 8) + '%';
            const angle = (Math.random() * Math.PI * 2), dist = 85 + Math.random() * 150;
            p.style.setProperty('--dx', (Math.cos(angle) * dist) + 'px');
            p.style.setProperty('--dy', (Math.sin(angle) * dist - 80) + 'px');
            p.style.setProperty('--rot', ((Math.random() * 720) - 360) + 'deg');
            p.style.setProperty('--delay', (Math.random() * 90) + 'ms');
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            layer.appendChild(p);
        } });
        document.body.appendChild(layer);
        setTimeout(() => layer.remove(), 1250);
    }
    function nextStageBetween(fromStep, toStep) {
        return STAGES.slice(1).find(st => st.step > fromStep && st.step <= toStep) || null;
    }
    function nextStageAhead() { return STAGES.slice(1).find(st => st.step > state.adventure.step) || null; }
    function merchantSafeDistances() {
        const md = state.settings.merchantDistance || {};
        const min = Math.max(1, Math.floor(Number(md.min) || 1)), max = Math.max(min, Math.floor(Number(md.max) || min));
        const idx = currentStageIndex(), current = STAGES[idx], fromCurrent = Math.max(0, state.adventure.step - current.step), next = nextStageAhead(), toNext = next ? next.step - state.adventure.step : 999;
        if (idx > 0 && fromCurrent < 2)
            return [];
        const safe = [];
        for (let d = min; d <= max; d++) {
            if (toNext - d >= 2)
                safe.push(d);
        }
        return safe;
    }
    function moveWithStageStop(spaces) {
        const from = Number(state.adventure.step) || 0;
        const wanted = Math.min(STAGES.at(-1).step, from + Math.max(0, Number(spaces) || 0));
        const stage = nextStageBetween(from, wanted);
        const dest = stage ? stage.step : wanted;
        const moved = Math.max(0, dest - from);
        state.adventure.step = dest;
        let merchantArrived = false;
        if (stage && state.adventure.pendingMerchantDistance > 0) {
            state.adventure.pendingMerchantDistance = 0;
        }
        else if (state.adventure.pendingMerchantDistance > 0 && moved > 0) {
            state.adventure.pendingMerchantDistance = Math.max(0, state.adventure.pendingMerchantDistance - moved);
            merchantArrived = state.adventure.pendingMerchantDistance === 0;
        }
        return { stage, moved, wantedSpaces: Math.max(0, Number(spaces) || 0), discarded: Math.max(0, (Math.max(0, Number(spaces) || 0)) - moved), merchantArrived };
    }
    // ============================================================
    // 성 보물창고 (실천의 성에 도착하면 열려요)
    // ============================================================
    function renderCastleShop() {
        const card = $('castleShopCard');
        if (!card)
            return;
        const arrived = state.adventure.step >= STAGES.at(-1).step;
        card.classList.toggle('hidden', !arrived);
        if (!arrived)
            return;
        $('castleAvailable').textContent = available();
        $('castleShopGrid').innerHTML = CASTLE_SHOP.map(it => `<button class="merchant-item castle-item${available() < it.price ? ' cant-buy' : ''}" data-castle-buy="${it.key}"><span class="merchant-icon">${it.icon}</span><b>${it.name}</b><small>${it.desc}</small><span class="merchant-price">${it.price}P</span></button>`).join('');
        document.querySelectorAll('[data-castle-buy]').forEach(b => b.onclick = () => askCastleBuy(b.dataset.castleBuy));
    }
    // ============================================================
    // 우리 반 예절 약속 (실천의 성 마지막 관문 뒤에 만들어요)
    // ============================================================
    function showPromiseMaker(afterDone) {
        const cur = state.promises || [];
        const inputs = Array.from({ length: PROMISE_COUNT }, (_, i) => `<label class="promise-input"><span>${i + 1}</span><input data-promise="${i}" maxlength="60" value="${esc(cur[i] || '')}" placeholder="${['예: 먼저 밝게 인사하기', '예: 친구 말을 끝까지 듣기', '예: 도움이 필요한 친구에게 먼저 묻기'][i] || '우리 반 약속'}"></label>`).join('');
        showEventPopup('🤝', UI_TEXT.promiseTitle + ' 만들기', `이번 모험에서 배운 것을 바탕으로<br><b>합숙이 끝나도 지키고 싶은 약속</b>을 함께 정해 보세요.<div class="promise-inputs">${inputs}</div><div class="event-note">하나 이상 적으면 저장할 수 있어요. 나중에 모험 지도 화면에서 고칠 수 있어요.</div>`, `<button class="secondary" id="promiseLater">나중에 정할게요</button><button class="primary" id="promiseSave">약속 저장</button>`);
        const done = () => { closeEventPopup(); if (typeof afterDone === 'function')
            setTimeout(afterDone, 180); };
        setTimeout(() => {
            $('promiseLater').onclick = done;
            $('promiseSave').onclick = () => {
                const list = [...document.querySelectorAll('[data-promise]')].map(el => el.value.trim()).filter(Boolean);
                if (!list.length) {
                    toast('약속을 하나 이상 적어 주세요.');
                    return;
                }
                state.promises = list;
                save();
                renderAll();
                fireStageCelebration();
                const atCastle = state.adventure.step >= STAGES.at(-1).step;
                showEventPopup('🤝', '약속을 정했어요!', `<ol class="promise-list">${list.map(p => `<li>${esc(p)}</li>`).join('')}</ol>${atCastle ? '<div class="event-note">이제 모험 화면 아래의 <b>성 보물창고</b>에서 남은 포인트를 쓸 수 있어요.</div>' : ''}`, eventOkButton('좋아요!'));
                bindEventOk(done);
            };
        }, 0);
    }
    function renderPromiseCard() {
        const card = $('promiseCard');
        if (!card)
            return;
        const show = state.promises.length > 0 || state.adventure.step >= STAGES.at(-1).step;
        card.classList.toggle('hidden', !show);
        if (!show)
            return;
        $('promiseTitle').textContent = UI_TEXT.promiseTitle;
        $('promiseBody').innerHTML = state.promises.length ? `<ol class="promise-list">${state.promises.map(p => `<li>${esc(p)}</li>`).join('')}</ol>` : '<div class="backpack-empty">아직 약속을 정하지 않았어요.</div>';
        $('promiseEdit').textContent = state.promises.length ? '약속 고치기' : '약속 정하기';
    }
    // ============================================================
    // 칭찬 쪽지함 (모험 지도 화면)
    // ============================================================
    function praiseRecords() { return state.records.filter(r => r.praiseText).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))); }
    let praiseFilter = 'recent';
    function renderPraiseBoard() {
        const list = $('praiseList');
        if (!list)
            return;
        $('praiseBoardTitle').textContent = UI_TEXT.praiseTitle;
        $('praiseBoardDesc').textContent = UI_TEXT.praiseDesc;
        const all = praiseRecords();
        const dates = [...new Set(all.map(r => r.date))].sort().reverse();
        const recentDates = new Set(dates.slice(0, PRAISE_RECENT_DAYS));
        const sel = $('praiseDateFilter');
        if (praiseFilter !== 'recent' && praiseFilter !== 'all' && !dates.includes(praiseFilter))
            praiseFilter = 'recent';
        sel.innerHTML = `<option value="recent">최근 ${PRAISE_RECENT_DAYS}일 (기록한 날 기준)</option>${dates.map(d => `<option value="${d}">${fmtDate(d)}</option>`).join('')}<option value="all">전체 보기</option>`;
        sel.value = praiseFilter;
        sel.onchange = () => { praiseFilter = sel.value; renderPraiseBoard(); };
        const rows = all.filter(r => praiseFilter === 'all' ? true : praiseFilter === 'recent' ? recentDates.has(r.date) : r.date === praiseFilter);
        $('praiseTotal').textContent = `${rows.length}장`;
        list.innerHTML = rows.length ? rows.map((r, i) => `<div class="praise-note tone-${i % 4}"><div class="praise-to">To. ${esc(r.praiseToName)}</div><p>${esc(r.praiseText)}</p><small>${fmtDate(r.date)}</small></div>`).join('') : '<div class="backpack-empty">아직 칭찬 쪽지가 없어요. 오늘의 기록에서 좋은 행동을 발견하면 쪽지를 남길 수 있어요.</div>';
    }
    function askCastleBuy(key) {
        const it = CASTLE_SHOP.find(x => x.key === key);
        if (!it)
            return;
        if (available() < it.price) {
            toast(`${it.price}P가 필요해요. 지금은 ${available()}P가 있어요.`);
            return;
        }
        showEventPopup(it.icon, '교환할까요?', `<b>${it.name}</b>을(를) <b>${it.price}P</b>로 교환할까요?<div class="event-note">${it.desc}</div>`, `<button class="secondary" id="castleCancel">조금 더 생각해 볼게요</button><button class="primary" id="castleConfirm">교환하기</button>`);
        setTimeout(() => {
            $('castleCancel').onclick = closeEventPopup;
            $('castleConfirm').onclick = () => {
                if (available() < it.price) {
                    closeEventPopup();
                    return;
                }
                spendPoints(it.price, it.icon, '성 보물창고', it.name + ' 교환');
                save();
                renderAll();
                showEventPopup(it.icon, '교환 완료!', `<b>${it.name}</b>을(를) 받았어요.<div class="event-note">이 화면을 선생님께 보여주세요.</div>`, eventOkButton('확인'));
                bindEventOk();
            };
        }, 0);
    }
    // 관문 도착 시 예절 퀴즈 (QUIZZES에 문제가 없는 구간은 예전처럼 STAGE_EVENTS 활동 문구를 보여줘요)
    function showStageEvent(stage, afterDone) {
        // 마지막 관문(실천의 성)은 퀴즈·활동이 끝나면 '우리 반 예절 약속 만들기'로 이어져요
        if (stage.key === STAGES.at(-1).key) {
            const after = afterDone;
            afterDone = () => showPromiseMaker(after);
        }
        const bank = quizBank(stage.key);
        if (Array.isArray(bank) && bank.length)
            return showStageQuiz(stage, bank, afterDone);
        const ev = STAGE_EVENTS[stage.key] || { icon: STAGE_ICONS[stage.key] || '✨', title: stage.name + ' 특별 이벤트', text: '우리 반이 ' + stage.name + '에 도착했어요. 짧은 지역 이벤트를 완료해 주세요.', button: '완료' };
        showEventPopup(ev.icon, ev.title, ev.text, eventOkButton(ev.button));
        bindEventOk(() => { closeEventPopup(); if (typeof afterDone === 'function')
            setTimeout(afterDone, 180); });
    }
    function showStageQuiz(stage, bank, afterDone, preview = false) {
        const quiz = bank[Math.floor(Math.random() * bank.length)];
        const options = quiz.choices.map((text, i) => ({ text, ok: i === quiz.answer }));
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        const icon = STAGE_ICONS[stage.key] || '✨';
        const buttons = options.map((o, i) => `<button class="secondary quiz-choice" data-quiz="${i}">${esc(o.text)}</button>`).join('');
        showEventPopup(icon, (preview ? '[미리보기] ' : '') + stage.name + ' 예절 퀴즈', `<div class="quiz-q">${esc(quiz.q)}</div><div class="event-note">우리 반이 함께 의논해서 하나를 골라 보세요.</div>`, buttons);
        setTimeout(() => {
            document.querySelectorAll('[data-quiz]').forEach(b => b.onclick = () => {
                const picked = options[Number(b.dataset.quiz)];
                const right = options.find(o => o.ok);
                const bonus = preview ? 0 : quizBonus();
                if (picked.ok && bonus) {
                    state.bank.earned += bonus;
                    save();
                    renderAll();
                }
                const extra = preview ? '<div class="event-note">미리보기라 포인트는 들어가지 않아요.</div>' : '';
                const body = picked.ok
                    ? `<b>정답이에요!${bonus ? ` 보너스 +${bonus}P` : ''}</b><br>${esc(quiz.explain)}${extra}`
                    : `정답은 <b>"${esc(right.text)}"</b>예요.<br>${esc(quiz.explain)}${extra}`;
                showEventPopup(picked.ok ? '🎉' : '💡', picked.ok ? '정답!' : '아쉬워요, 같이 알아봐요', body, eventOkButton('다음으로'));
                bindEventOk(() => { closeEventPopup(); if (typeof afterDone === 'function')
                    setTimeout(afterDone, 180); });
            });
        }, 0);
    }
    function showStageArrival(stage, detail = '', afterDone) {
        fireStageCelebration();
        const icon = STAGE_ICONS[stage.key] || '🎉';
        const extra = detail ? `<div class="stage-arrival-note">${detail}</div>` : '';
        showEventPopup(icon, stage.name + '에 도착했습니다!', `우리 반이 드디어 <b>${stage.name}</b>에 도착했어요!${extra}`, eventOkButton('확인'));
        bindEventOk(() => { closeEventPopup(); setTimeout(() => showStageEvent(stage, afterDone), 220); });
    }
    $('moveBtn').onclick = () => { if (state.adventure.forkPending)
        showChoicePath();
    else if (state.adventure.merchantPending)
        showMerchant();
    else
        moveOneStep(); };
    function moveOneStep() {
        if (state.adventure.step >= STAGES.at(-1).step) {
            toast('이미 실천의 성에 도착했어요!');
            return;
        }
        const cost = currentMoveCost();
        if (available() < cost) {
            toast(`버스로 1칸 이동하려면 ${cost}P가 필요해요.`);
            return;
        }
        spendPoints(cost, state.adventure.carryingChest ? '📦' : '🚩', state.adventure.carryingChest ? '보물상자 운반 이동' : '모험 버스 이동', state.adventure.carryingChest ? '보물상자를 버스에 싣고 1칸 이동' : `${cost}P로 버스가 1칸 이동`);
        if (state.adventure.slowNextMove) {
            state.adventure.slowNextMove = false;
            save();
            renderAll();
            showEventPopup('🚌', '잠시 정차했어요!', `목이 말라 잠깐 쉬어 가기로 했어요.<br><b>${cost}P를 사용했지만 이번에는 한 칸도 이동하지 못했습니다.</b><div class="event-note">이제 다시 평소처럼 이동할 수 있어요.</div>`, eventOkButton('다시 힘내기'));
            bindEventOk();
            return;
        }
        // 깃털 할인은 실제로 이동했을 때만 1회 줄어들어요 (쉬어 가느라 제자리였던 이동은 세지 않아요)
        consumeFeatherMove();
        const result = moveWithStageStop(1);
        save();
        renderAll();
        if (result.stage) {
            showStageArrival(result.stage, '목적지에 도착했기 때문에 이번 이동은 여기서 멈춥니다.');
            return;
        }
        if (result.merchantArrived) {
            state.adventure.merchantPending = true;
            save();
            renderAll();
            toast('🧳 길거리 상인을 만날 수 있어요! 이동 버튼이 바뀌었어요.');
            return;
        }
        if (state.adventure.pendingMerchantDistance > 0) {
            toast(`🚌 1칸 이동! 상인까지 ${state.adventure.pendingMerchantDistance}칸 남았어요.`);
            return;
        }
        if (!maybeEvent())
            toast(`🚌 ${cost}P를 사용해 버스가 1칸 이동했어요.`);
    }
    // ============================================================
    // 11. 배낭 아이템 사용 (안내지도·쾌속권·망원경·나침반·깃털)
    // ============================================================
    function useBackpackItem(key) {
        if (key === 'map')
            return armChoicePathMap();
        if (key === 'free')
            return useFreeMove();
        if (key === 'telescope')
            return useTelescope();
        if (key === 'compass')
            return useTreasureCompass();
        if (key === 'feather')
            return useTravelFeather();
    }
    function armChoicePathMap() {
        if (state.adventure.inventory.map <= 0 || state.adventure.mapArmed)
            return;
        state.adventure.inventory.map--;
        state.adventure.mapArmed = true;
        save();
        renderAll();
        toast('🗺️ 안내지도를 준비했어요. 다음 선택의 길에서 자동으로 힌트를 보여줘요.');
    }
    function useFreeMove() {
        if (state.adventure.inventory.free <= 0)
            return;
        if (state.adventure.step >= STAGES.at(-1).step) {
            toast('이미 실천의 성에 도착했어요!');
            return;
        }
        state.adventure.inventory.free--;
        const result = moveWithStageStop(1);
        save();
        renderAll();
        if (result.stage) {
            showStageArrival(result.stage, '쾌속 주행권을 사용했지만 목적지에 도착해 여기서 멈춥니다.');
            return;
        }
        if (result.merchantArrived) {
            state.adventure.merchantPending = true;
            save();
            renderAll();
            toast('🧳 길거리 상인을 만날 수 있어요! 이동 버튼이 바뀌었어요.');
            return;
        }
        showEventPopup('🎫', '쾌속 주행!', `쾌속 주행권을 사용해 <b>모험 버스가 포인트 없이 1칸</b> 이동했어요.`, eventOkButton());
        bindEventOk();
    }
    function useTelescope() {
        if (state.adventure.inventory.telescope <= 0 || state.adventure.previewEvent)
            return;
        const events = availableEventKinds().filter(([kind]) => kind !== 'mysteryMerchant');
        const kind = weightedEventChoice(events);
        if (!kind) {
            toast('지금은 망원경으로 확인할 이벤트가 없어요.');
            return;
        }
        state.adventure.inventory.telescope--;
        state.adventure.previewEvent = kind;
        save();
        renderAll();
        showEventPopup(iconHTML('telescope', 'lg'), '앞길을 살펴봤어요!', `멀리 살펴보니 다음 랜덤 이벤트에는 <b>${eventLabel(kind)}</b>의 기운이 보여요.<div class="event-note">언제 나타날지는 알 수 없지만, 다음에 랜덤 이벤트가 발생하면 이 이벤트가 나타납니다.</div>`, eventOkButton('확인'));
        bindEventOk();
    }
    function useTreasureCompass() {
        if (state.adventure.inventory.compass <= 0 || state.adventure.compassArmed || state.adventure.carryingChest)
            return;
        state.adventure.inventory.compass--;
        state.adventure.compassArmed = true;
        save();
        renderAll();
        showEventPopup('🧭', '보물 나침반이 반응해요!', `나침반 바늘이 강하게 흔들리고 있어요.<br><b>다음 랜덤 이벤트가 발생하면 보물상자를 발견합니다.</b>`, eventOkButton('좋아!'));
        bindEventOk();
    }
    function useTravelFeather() {
        if (state.adventure.inventory.feather <= 0 || state.adventure.featherMoves > 0)
            return;
        state.adventure.inventory.feather--;
        state.adventure.featherMoves = 3;
        save();
        renderAll();
        showEventPopup('🪶', '버스가 가벼워졌어요!', `가벼운 여행깃털의 힘으로 <b>다음 유료 이동 3회는 각각 2P 할인</b>됩니다.`, eventOkButton('출발!'));
        bindEventOk();
    }
    // ============================================================
    // 12. 이벤트별 처리 (상인·수상한 상인·선택의 길·보물상자·돌발사건·생활)
    // ============================================================
    function maybeEvent() {
        const events = availableEventKinds();
        const totalChance = events.reduce((sum, [, chance]) => sum + chance, 0);
        if (!events.length || Math.random() * 100 >= totalChance)
            return false;
        let kind = state.adventure.previewEvent && events.some(([k]) => k === state.adventure.previewEvent) ? state.adventure.previewEvent : weightedEventChoice(events);
        state.adventure.previewEvent = '';
        if (state.adventure.compassArmed && !state.adventure.carryingChest && events.some(([k]) => k === 'chest')) {
            kind = 'chest';
            state.adventure.compassArmed = false;
        }
        save();
        return triggerAdventureEvent(kind);
    }
    function showMerchantSighting() {
        const choices = merchantSafeDistances();
        if (!choices.length)
            return false;
        const distance = choices[Math.floor(Math.random() * choices.length)];
        state.adventure.pendingMerchantDistance = distance;
        state.adventure.merchantPending = false;
        save();
        renderAll();
        showEventPopup(iconHTML('merchant', 'lg'), '저 멀리 상인이 보인다!', `길 끝에서 무언가 반짝였어요.<br><b>${distance}칸 안에 길거리 상인을 만나게 됩니다.</b><div class="event-note">목적지 근처에서는 상인이 등장하지 않아요. 상인을 만나기 전에 포인트를 조금 남겨 두는 것도 좋겠어요.</div>`, eventOkButton('상인을 향해 출발'));
        bindEventOk();
        return true;
    }
    function showMerchant() { state.adventure.merchantPending = true; save(); renderMerchantPopup(); }
    function renderMerchantPopup() {
        const offers = [...SHOP].sort(() => Math.random() - .5).slice(0, Math.min(3, SHOP.length));
        const items = offers.map(it => { const price = shopPrice(it.key, it.price); return `<button class="merchant-item" data-merchant-buy="${it.key}"><span class="merchant-icon">${it.icon}</span><b>${it.name}</b><small>${it.desc}</small><span class="merchant-price">${price}P</span></button>`; }).join('');
        showEventPopup(iconHTML('merchant', 'lg'), '길거리 상인을 만났다!', `"좋은 물건이 들어왔어요. 구경하고 가세요!"<div class="merchant-grid">${items}</div><div class="event-note">필요한 물건 하나만 골라 사고, 그냥 지나가도 괜찮아요.</div>`, `<button class="secondary" id="leaveMerchantBtn">그냥 지나간다</button>`);
        const modalBox = document.querySelector('#adventureEventModal .adventure-event-modal');
        if (modalBox)
            modalBox.classList.add('merchant-wide');
        setTimeout(() => { document.querySelectorAll('[data-merchant-buy]').forEach(b => b.onclick = () => buyItem(b.dataset.merchantBuy)); $('leaveMerchantBtn').onclick = leaveMerchant; }, 0);
    }
    function leaveMerchant() { state.adventure.merchantPending = false; save(); renderAll(); closeEventPopup(); toast('상인은 다음 길로 떠났어요.'); }
    function buyItem(key) { const it = SHOP.find(x => x.key === key); if (!it)
        return; const price = shopPrice(it.key, it.price); if (available() < price) {
        toast('포인트가 부족해요.');
        return;
    } spendPoints(price, '🧳', '길거리 상인', it.name + ' 구매'); state.adventure.inventory[key] = (state.adventure.inventory[key] || 0) + 1; state.adventure.merchantPending = false; save(); renderAll(); closeEventPopup(); toast(`${it.name}을 얻었어요. 상인은 길을 떠났어요.`); }
    const MYSTERY_MERCHANT_PRICES = [10, 20, 30, 40];
    function mysterySettings() {
        const base = { goodChances: { 10: 40, 20: 55, 30: 70, 40: 80 } };
        const s = state.settings.mysteryMerchantSettings || {};
        return { ...base, ...s, goodChances: { ...base.goodChances, ...(s.goodChances || {}) }, icons: MYSTERY_ICONS };
    }
    function mysteryMerchantChoices() { const ms = mysterySettings(); return MYSTERY_MERCHANT_PRICES.map(price => ({ price, goodChance: Math.max(0, Math.min(100, Number(ms.goodChances[price]) || 0)) })); }
    function mysteryGoodRewards() {
        const icons = mysterySettings().icons;
        return [
            { icon: '⭐', title: '반짝이는 포인트 주머니!', text: '모험 포인트 <b>+10P</b>를 얻었어요.', apply: () => state.bank.earned += 10 },
            { icon: '🌟', title: '큰 포인트 주머니!', text: '모험 포인트 <b>+20P</b>를 얻었어요.', apply: () => state.bank.earned += 20 },
            { icon: '🎫', title: '쾌속 주행권!', text: '모험 배낭에 <b>쾌속 주행권 1개</b>를 넣었어요.', apply: () => state.adventure.inventory.free++ },
            { icon: '🗺️', title: '숨겨 둔 지도!', text: '모험 배낭에 <b>숲길 안내지도 1개</b>를 넣었어요.', apply: () => state.adventure.inventory.map++ },
            { icon: iconHTML('telescope', 'lg'), title: '멀리 보는 망원경!', text: '모험 배낭에 <b>앞길 망원경 1개</b>를 넣었어요.', apply: () => state.adventure.inventory.telescope++ },
            { icon: icons.snack || '🍪', title: '간식 교환권?!', text: '수상한 상인이 <b>작은 간식 1개 교환권</b>을 건넸어요. 선생님께 보여주세요.', apply: () => { } },
            { icon: icons.coupon || '⏱️', title: '3분 쿠폰!', text: '오늘 수업에서 사용할 수 있는 <b>3분 일찍 마치기 쿠폰</b>이 나왔어요.', apply: () => { } }
        ];
    }
    const MYSTERY_DUD_REWARDS = [
        { icon: '🙌', title: '선생님의 열렬한 환호!', text: '상자를 열었더니… <b>선생님의 열렬한 환호</b>가 들어 있었어요. 힘내요! 영차!', apply: () => { } },
        { icon: '🪨', title: '반짝이는 돌멩이', text: '엄청난 보물처럼 보였지만… <b>그냥 예쁜 돌멩이</b>였어요.', apply: () => { } },
        { icon: '💌', title: '좋은 하루 되세요!', text: '봉투 안에는 <b>“오늘도 좋은 하루!”</b>라는 쪽지만 들어 있었어요.', apply: () => { } },
        { icon: iconHTML('emptychest', 'lg'), title: '빈 상자였다!', text: '두근두근 열어봤지만… <b>아무것도 없었어요.</b>', apply: () => { } }
    ];
    function showMysteryMerchant() {
        const ms = mysterySettings(), choices = mysteryMerchantChoices().map(c => `<button class="mystery-buy" data-mystery-price="${c.price}" data-mystery-chance="${c.goodChance}"><span class="mystery-q">${iconHTML('question', 'lg')}</span><span class="mystery-price">${c.price}P</span></button>`).join('');
        showEventPopup(iconHTML('mysterymerchant', 'lg'), '갑자기 수상한 상인이 나타났다!', `"쉿… 평범한 물건은 안 팝니다."<br>정체를 알 수 없는 물건 네 개를 내밀었어요.<div class="mystery-grid">${choices}</div><div class="mystery-chance-note">가격마다 좋은 결과가 나올 확률이 달라요. 무엇이 나올지는 아무도 몰라요.</div>`, `<button class="secondary" id="leaveMysteryMerchantBtn">수상해서 그냥 지나간다</button>`);
        const modalBox = document.querySelector('#adventureEventModal .adventure-event-modal');
        if (modalBox)
            modalBox.classList.add('mystery-merchant-modal');
        setTimeout(() => { document.querySelectorAll('[data-mystery-price]').forEach(b => b.onclick = () => buyMysteryItem(Number(b.dataset.mysteryPrice), Number(b.dataset.mysteryChance))); $('leaveMysteryMerchantBtn').onclick = closeEventPopup; }, 0);
    }
    function buyMysteryItem(price, goodChance) {
        price = Math.max(0, Number(price) || 0);
        goodChance = Math.max(0, Math.min(100, Number(goodChance) || 0));
        if (available() < price) {
            toast(`${price}P가 필요해요.`);
            return;
        }
        spendPoints(price, '🕵️', '수상한 상인', `정체불명 물건 ${price}P 구매`);
        const good = Math.random() * 100 < goodChance;
        const pool = good ? mysteryGoodRewards() : MYSTERY_DUD_REWARDS;
        const reward = pool[Math.floor(Math.random() * pool.length)];
        reward.apply();
        save();
        renderAll();
        showEventPopup(reward.icon, reward.title, `${reward.text}<div class="event-note">수상한 상인에게 ${price}P를 사용했어요. ${good ? '이번 선택은 좋은 결과였습니다!' : '이번에는 아쉽지만 다음 기회를 노려봐요.'}</div>`, eventOkButton('확인'));
        bindEventOk();
    }
    let pendingChoicePath = null;
    const rangeText = (min, max) => min === max ? `${min}칸` : `${min}~${max}칸`;
    // 선택의 길 한쪽의 '1칸당 평균 비용' (기본 이동비보다 싸면 지름길이 돼요)
    function forkPerStep(cost, min, max) { const avg = (Number(min) + Number(max)) / 2; return avg > 0 ? Number(cost) / avg : 0; }
    function forkBalanceHtml(fs) {
        const base = baseMoveCost();
        const side = (label, cost, min, max) => { const per = forkPerStep(cost, min, max); const cheap = per < base; return `<div class="${cheap ? 'fork-warn' : 'fork-ok'}">${label}: ${cost}P로 ${rangeText(min, max)} → <b>1칸당 평균 ${Math.round(per * 10) / 10}P</b> ${cheap ? `⚠️ 기본 이동(${base}P)보다 싸서 지름길이 돼요` : '✓'}</div>`; };
        return side('왼쪽(안전한 길)', fs.leftCost, fs.leftMin, fs.leftMax) + side('오른쪽(모험 길)', fs.rightCost, fs.rightMin, fs.rightMax) + `<small>1칸당 평균 비용을 기본 이동비(${base}P)와 같거나 조금 비싸게 두면, 선택의 길은 '빨라지는 길'이 아니라 '함께 고민하는 갈림길'이 돼요.</small>`;
    }
    function showChoicePath() {
        if (!state.adventure.forkPending)
            return;
        const type = CHOICE_PATH_TYPES[Math.floor(Math.random() * CHOICE_PATH_TYPES.length)];
        const fs = state.settings.forkSettings || {};
        const leftCost = Math.max(0, Number(type.leftCost ?? fs.leftCost) || 0), rightCost = Math.max(0, Number(type.rightCost ?? fs.rightCost) || 0);
        const lmin = Math.max(1, Math.floor(Number(type.leftMin ?? fs.leftMin) || 1)), lmax = Math.max(lmin, Math.floor(Number(type.leftMax ?? fs.leftMax) || lmin)), rmin = Math.max(1, Math.floor(Number(type.rightMin ?? fs.rightMin) || 1)), rmax = Math.max(rmin, Math.floor(Number(type.rightMax ?? fs.rightMax) || rmin));
        pendingChoicePath = { type, leftCost, rightCost, left: lmin + Math.floor(Math.random() * (lmax - lmin + 1)), right: rmin + Math.floor(Math.random() * (rmax - rmin + 1)) };
        const mapWasArmed = !!state.adventure.mapArmed;
        let hintHtml = type.hint;
        if (mapWasArmed) {
            const side = pendingChoicePath.left >= pendingChoicePath.right ? 'left' : 'right', better = side === 'left' ? `${type.leftIcon} ${type.leftName}` : `${type.rightIcon} ${type.rightName}`;
            hintHtml = `🗺️ 지도에 희미한 표시가 있어요.<br><b>${better} 쪽이 조금 더 유리해 보입니다.</b>`;
            state.adventure.mapArmed = false;
            save();
            renderAll();
        }
        showEventPopup(type.icon, type.title, `${type.text}<div id="forkHint" class="event-note">${hintHtml}</div>`, `<button class="secondary" id="leftFork">${type.leftIcon} ${type.leftName} · ${leftCost}P · ${rangeText(lmin, lmax)}</button><button class="primary" id="rightFork">${type.rightIcon} ${type.rightName} · ${rightCost}P · ${rangeText(rmin, rmax)}</button>`);
        setTimeout(() => { $('leftFork').onclick = () => choosePath('left'); $('rightFork').onclick = () => choosePath('right'); }, 0);
    }
    function choosePath(side) {
        if (!pendingChoicePath || !state.adventure.forkPending)
            return;
        const cost = Math.max(0, Number(side === 'left' ? pendingChoicePath.leftCost : pendingChoicePath.rightCost) || 0);
        if (available() < cost) {
            toast('포인트가 부족해요.');
            return;
        }
        const t = pendingChoicePath.type, label = side === 'left' ? `${t.leftIcon} ${t.leftName}` : `${t.rightIcon} ${t.rightName}`;
        spendPoints(cost, '↗️', '선택의 길', label + ' 선택');
        const spaces = pendingChoicePath[side];
        pendingChoicePath = null;
        state.adventure.forkPending = false;
        const result = moveWithStageStop(spaces);
        if (result.merchantArrived)
            state.adventure.merchantPending = true;
        save();
        renderAll();
        if (result.stage) {
            const detail = result.discarded > 0 ? `선택의 길 결과는 <b>+${spaces}칸</b>이었지만 <b>${result.stage.name}</b>에 먼저 도착해 ${result.moved}칸만 이동했습니다.<br>남은 <b>${result.discarded}칸은 추가로 이동하지 않습니다.</b>` : `선택의 길을 지나 <b>${result.stage.name}</b>에 도착했습니다.`;
            showStageArrival(result.stage, detail);
            return;
        }
        showEventPopup('↗️', '선택의 길 통과!', `${label}을 선택했어요.<br><b>${cost}P를 사용해 ${result.moved}칸 이동</b>했습니다.`, eventOkButton());
        bindEventOk(() => { closeEventPopup(); if (result.merchantArrived)
            toast('🧳 길거리 상인을 만날 수 있어요! 상인 만나기 버튼을 눌러 보세요.'); });
    }
    function showChest() {
        if (keyCount() > 0) {
            showEventPopup(iconHTML('chest', 'lg'), '보물상자를 발견했다!', `마침 <b>탐험 열쇠 ${iconHTML('key', 'xs')} ${keyCount()}개</b>가 있어요.<br>열쇠 1개로 지금 보물상자를 열 수 있습니다.`, `<button class="primary" id="openChestBtn">${iconHTML('key', 'xs')} 열쇠로 열기</button><button class="secondary" id="leaveChestBtn">그냥 지나간다</button>`);
            setTimeout(() => { $('openChestBtn').onclick = openChest; $('leaveChestBtn').onclick = closeEventPopup; }, 0);
            return;
        }
        showEventPopup(iconHTML('chest', 'lg'), '보물상자를 발견했다!', `하지만 지금은 <b>탐험 열쇠가 없어요.</b><br>그냥 지나가거나, <br> 열쇠를 얻을 때까지 상자를 버스에 싣고 갈 수 있어요.<div class="event-note">상자를 버스에 싣고 가면 무거워서 이후 이동은 <b>${carryMoveCost()}P로 1칸</b>입니다.</div>`, `<button class="secondary" id="leaveChestBtn">그냥 지나간다</button><button class="primary" id="carryChestBtn">🚌 버스에 싣는다</button>`);
        setTimeout(() => { $('leaveChestBtn').onclick = closeEventPopup; $('carryChestBtn').onclick = carryChest; }, 0);
    }
    function carryChest() { state.adventure.carryingChest = true; save(); renderAll(); showEventPopup(iconHTML('chest', 'lg'), '보물상자를 버스에 싣는다!', `우리는 보물상자를 버스에 싣고 가기로 했어요.<br>열쇠를 얻을 때까지 <b>${carryMoveCost()}P로 1칸씩</b> 이동합니다.`, eventOkButton()); bindEventOk(); }
    function openChest() { if (keyCount() <= 0) {
        toast('탐험 열쇠가 필요해요.');
        return;
    } state.adventure.inventory.key = keyCount() - 1; state.adventure.carryingChest = false; chestReward(); }
    function chestReward() {
        const all = { early: '⏰ 오늘 수업을 3분 일찍 마칠 수 있어요!', snack: '🍬 선생님 주머니에서 작은 간식을 발견했어요!', free: '🎫 쾌속 주행권 1개를 얻었어요!', note: '⭐ 우리 반에 보너스 포인트 10P가 들어왔어요!', present: '🗺️ 숲길 안내지도 1개를 얻었어요!' };
        let keys = Object.entries(state.settings.chestRewards || {}).filter(([k, v]) => v && all[k]).map(([k]) => k);
        if (!keys.length)
            keys = ['free', 'note', 'present'];
        const k = keys[Math.floor(Math.random() * keys.length)];
        const r = all[k];
        if (k === 'free')
            state.adventure.inventory.free++;
        if (k === 'note')
            state.bank.earned += 10;
        if (k === 'present')
            state.adventure.inventory.map++;
        save();
        renderAll();
        showEventPopup('✨', '보물상자가 열렸다!', `<b>${r}</b><div class="event-note">보물상자는 탐험 열쇠로 연 특별 보상이라 꽝이 없어요.${keyCount() > 0 ? ` (남은 열쇠 ${keyCount()}개)` : ''}</div>`, eventOkButton('좋아!'));
        bindEventOk();
    }
    function showRoadEvent() {
        showEventPopup('📄', '길 위에 접힌 종이가 떨어져 있다!', `왠지 그냥 지나치기엔 신경이 쓰여요.<br>우리 반은 어떻게 할까요?`, `<button class="secondary" id="paperOpenBtn">📄 주워서 열어본다</button><button class="primary" id="paperTrashBtn">🗑️ 주워서 쓰레기통에 넣는다</button>`);
        setTimeout(() => { $('paperOpenBtn').onclick = () => resolvePaper('open'); $('paperTrashBtn').onclick = () => resolvePaper('trash'); }, 0);
    }
    function resolvePaper(choice) {
        if (choice === 'open') {
            if (Math.random() < .55) {
                const loss = Math.min(Math.max(0, Math.floor(settingNum('roadSettings', 'loss', 10))), available());
                spendPoints(loss, '📄', '길 위 돌발사건', '통행료 청구서');
                save();
                renderAll();
                showEventPopup('😵', '앗, 통행료 청구서였다!', `종이를 펼쳤더니 작은 글씨로 통행료가 적혀 있었어요.<br><b>${loss}P를 잃었습니다.</b>`, eventOkButton('다시 출발'));
                bindEventOk();
            }
            else {
                const gain = Math.max(0, Math.floor(settingNum('roadSettings', 'gain', 5)));
                state.bank.earned += gain;
                save();
                renderAll();
                showEventPopup('🍀', '행운 쿠폰이었다!', `우연히 행운 쿠폰을 발견했어요.<br><b>${gain}P를 얻었습니다.</b>`, eventOkButton('신난다!'));
                bindEventOk();
            }
        }
        else {
            if (Math.random() < .5) {
                const gain = Math.max(0, Math.floor(settingNum('roadSettings', 'gain', 5)));
                state.bank.earned += gain;
                save();
                renderAll();
                showEventPopup('🌱', '길을 깨끗하게 만들었다!', `누군가의 감사 쪽지가 나타났어요.<br><b>${gain}P를 얻었습니다.</b>`, eventOkButton('계속 가기'));
                bindEventOk();
            }
            else {
                showEventPopup('🗑️', '깨끗하게 정리했다!', `종이를 쓰레기통에 넣었어요.<br>별일은 없었지만 길이 조금 깨끗해졌습니다.`, eventOkButton());
                bindEventOk();
            }
        }
    }
    function showLifeEvent() {
        showEventPopup('🥤', '버스를 타고 한참 이동하니 목이 마르다!', `마침 길가에 자판기가 있어요.<br>음료수를 사 마실까요?`, `<button class="primary" id="drinkBuyBtn">🥤 ${Math.max(0, Math.floor(settingNum('lifeSettings', 'drinkCost', 10)))}P로 음료수 사기</button><button class="secondary" id="drinkPassBtn">조금 더 참는다</button>`);
        setTimeout(() => { $('drinkBuyBtn').onclick = buyDrink; $('drinkPassBtn').onclick = passDrink; }, 0);
    }
    function passDrink() {
        const chance = Math.max(0, Math.min(100, Number(settingNum('lifeSettings', 'slowChance', 50)) || 0));
        if (Math.random() * 100 < chance) {
            state.adventure.slowNextMove = true;
            save();
            renderAll();
            showEventPopup('🥵', '잠시 쉬어가기로 했어요!', `음료수를 마시지 않고 계속 이동하기로 했지만 조금 지쳤어요.<br><b>다음 유료 이동에서는 포인트를 사용해도 이동하지 못합니다.</b><div class="event-note">이 효과는 다음 유료 이동 1회만 적용돼요.</div>`, eventOkButton('알겠어'));
            bindEventOk();
        }
        else {
            showEventPopup('🚌', '괜찮아, 계속 갈 수 있다!', `음료수를 마시지 않았지만 이번에는 별일 없이 계속 갈 수 있어요.`, eventOkButton());
            bindEventOk();
        }
    }
    function buyDrink() { const cost = Math.max(0, Math.floor(settingNum('lifeSettings', 'drinkCost', 10))); if (available() < cost) {
        toast(`음료수를 사려면 ${cost}P가 필요해요.`);
        return;
    } spendPoints(cost, '🥤', '생활형 이벤트', '자판기 음료수'); save(); renderAll(); showEventPopup('🥤', '시원하다!', `우리 반은 버스를 잠시 세우고 음료수를 마셨어요.<br><b>${cost}P를 사용했습니다.</b>`, eventOkButton('다시 출발')); bindEventOk(); }
    $('getTodayKey').onclick = () => { pinMode = 'teacherKey'; $('teacherPinInput').value = ''; modal('teacherLockModal', true); };
    // ============================================================
    // 13. 교사 설정 화면
    // ============================================================
    function fmtDate(d) { if (!d)
        return ''; try {
        return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short' }).format(new Date(d + 'T00:00:00'));
    }
    catch (e) {
        return d;
    } }
    function recordCountToday() { return state.records.filter(r => r.date === today()).length; }
    function goodNoticeCount() { return state.records.filter(r => r.notice === '발견했어요').length; }
    function renderTeacher() {
        const active = state.students.filter(s => s.active !== false), todayRecords = state.records.filter(r => r.date === today());
        $('teacherDashboard').innerHTML = `<div class="metric-grid-admin"><div class="metric-admin"><small>총 적립 포인트</small><strong>${state.bank.earned}P</strong></div><div class="metric-admin"><small>오늘 참여</small><strong>${todayRecords.length} / ${active.length}</strong></div><div class="metric-admin"><small>칭찬 쪽지</small><strong>${praiseRecords().length}장</strong></div><div class="metric-admin"><small>전체 기록 수</small><strong>${state.records.length}</strong></div></div><div class="admin-card" style="margin-top:14px"><h3>오늘 참여 현황</h3><p class="admin-sub">학생별 오늘 기록 여부와 누적 기록 수를 확인해요.</p><div class="table-wrap"><table class="admin-table"><thead><tr><th>학생</th><th>좌석</th><th>오늘 제출</th><th>누적 기록</th><th>보유 배지</th></tr></thead><tbody>${active.map(s => `<tr><td>${esc(s.name)}</td><td>${s.seat}번</td><td>${s.submittedToday ? '✅ 완료' : '아직'}</td><td>${s.records || 0}회</td><td>${s.badges.length}개</td></tr>`).join('')}</tbody></table></div></div><div class="admin-card" style="margin-top:14px"><h3>테스트용 임시 포인트</h3><p class="admin-sub">모험 기능을 시험할 때만 사용하는 포인트예요. 학생 기록으로 적립된 포인트와 별도로 저장됩니다.</p><div class="metric-grid-admin" style="margin-bottom:14px"><div class="metric-admin"><small>기록으로 적립</small><strong>${state.bank.earned}P</strong></div><div class="metric-admin"><small>임시 지급</small><strong>${Number(state.bank.temp || 0)}P</strong></div><div class="metric-admin"><small>사용한 포인트</small><strong>${state.bank.used}P</strong></div><div class="metric-admin"><small>현재 사용 가능</small><strong>${available()}P</strong></div></div><div class="actions"><button class="secondary" type="button" data-temp-point="10">+10P</button><button class="secondary" type="button" data-temp-point="50">+50P</button><button class="secondary" type="button" data-temp-point="100">+100P</button></div><div class="form-grid" style="margin-top:12px;grid-template-columns:minmax(0,220px) auto"><div class="field"><label>직접 입력</label><input id="tempPointInput" type="number" min="1" step="1" placeholder="예: 200"></div><div class="actions" style="align-items:end;margin-top:0"><button class="primary" id="addTempPoint" type="button">임시 포인트 지급</button><button class="danger" id="clearTempPoint" type="button">임시 포인트 0P로</button></div></div><div class="snapshot-note">※ 임시 포인트를 사용해 이동한 뒤 0P로 돌려도 이미 사용한 포인트와 모험 진행은 되돌아가지 않아요.</div><div class="danger-zone" style="margin-top:16px"><h3>모험 테스트 초기화</h3><p class="admin-sub">학생 명단과 기록은 그대로 두고, 테스트용 포인트·사용내역·모험 위치·아이템·열쇠·상자 상태·예절 약속만 처음으로 돌립니다.</p><button class="danger" id="resetAdventureTest" type="button">모험 테스트 데이터 초기화</button></div></div>`;
        $('teacherParticipants').innerHTML = `<div class="admin-card"><h3>참여자 설정</h3><p class="admin-sub">이름, 색, 버스 좌석, 개인 비밀번호, 사용 여부를 바꿀 수 있어요.</p><div>${state.students.map((s, i) => `<div class="student-edit-row"><span class="seat-index">${i + 1}</span><input data-student-name="${s.id}" value="${esc(s.name)}"><input class="student-color-picker" data-student-color="${s.id}" type="color" value="${/^#[0-9a-fA-F]{6}$/.test(String(s.color || '')) ? s.color : COLORS[i % COLORS.length]}" title="학생 색상 직접 선택"><select class="seat-select" data-student-seat="${s.id}">${Array.from({ length: 9 }, (_, j) => `<option value="${j + 1}" ${Number(s.seat) === j + 1 ? 'selected' : ''}>${j + 1}번 좌석</option>`).join('')}</select><input class="pin-edit" data-student-pin="${s.id}" type="password" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" value="${esc(s.pin)}" autocomplete="new-password"><label class="active-edit" style="font-size:12px;font-weight:850;display:flex;gap:5px;align-items:center"><input type="checkbox" data-student-active="${s.id}" ${s.active !== false ? 'checked' : ''}>사용</label></div>`).join('')}</div><div class="actions"><button class="primary" id="saveParticipants">참여자 저장</button></div></div>`;
        $('teacherSettings').innerHTML = `<div class="admin-card"><h3>활동 기본 설정</h3><p class="admin-sub">홈 화면의 '며칠차'는 시작일·종료일 기준으로 자동 계산돼요.</p><div class="form-grid three"><div class="field"><label>활동일</label><input id="setActiveDate" type="date" value="${esc(state.settings.activeDate)}"></div><div class="field"><label>기록 1회 기본 포인트</label><input id="setRecordPoints" type="number" min="0" value="${state.settings.recordPoints}"></div><div class="field"><label>시작일</label><input id="setStartDate" type="date" value="${esc(state.settings.startDate)}"></div><div class="field"><label>종료일</label><input id="setEndDate" type="date" value="${esc(state.settings.endDate)}"></div><div class="field"><label>완주 예상 목표 포인트</label><input id="setTargetPoints" type="number" min="1" value="${state.settings.targetPoints}"></div><div class="field"><label>최종 공동 상품/보상</label><input id="setPrizeName" value="${esc(state.settings.prizeName)}"></div><div class="field"><label>전원 제출 보너스 (P, 0이면 끔)</label><input id="setAllSubmitBonus" type="number" min="0" value="${allSubmitBonusAmount()}"></div></div></div><div class="admin-card"><h3>우리의 공동 목표</h3><div class="form-grid"><div class="field" style="grid-column:1/-1"><label>공동 목표 내용</label><input id="setGoal" value="${esc(state.settings.goal)}"></div></div><div class="actions"><button class="primary" id="saveSettings">목표·상품 설정 저장</button></div></div><div class="admin-card password-card"><h3>교사 비밀번호 설정</h3><p class="admin-sub">학생 비밀번호와 별개인 선생님 관리 전용 비밀번호입니다. 한글·영문·숫자를 사용할 수 있어요.</p><div class="form-grid" style="max-width:520px"><div class="field"><label>새 교사 비밀번호</label><input id="setTeacherPin" type="password" maxlength="40" placeholder="4자 이상 입력" autocomplete="new-password"></div><div class="field"><label>새 비밀번호 확인</label><input id="setTeacherPinConfirm" type="password" maxlength="40" placeholder="한 번 더 입력" autocomplete="new-password"></div></div><div class="actions"><button class="primary" id="saveTeacherPin" type="button">교사 비밀번호 변경</button></div></div>`;
        const rewards = state.settings.chestRewards || DEFAULT_REWARDS;
        const ep = state.settings.eventProbabilities || {};
        const md = state.settings.merchantDistance || {};
        const fs = state.settings.forkSettings || {};
        const rs = state.settings.roadSettings || {};
        const ls = state.settings.lifeSettings || {};
        const ms = mysterySettings();
        const probTotal = ['fork', 'merchant', 'mysteryMerchant', 'chest', 'road', 'life'].reduce((a, k) => a + (Number(ep[k]) || 0), 0);
        $('teacherBonus').innerHTML = `<div class="admin-card"><h3>모험 기본 규칙</h3><p class="admin-sub">모험에서 사용하는 포인트 비용과 기본 규칙을 설정해요.</p><div class="adventure-settings-grid"><div class="field"><label>기본 1칸 이동비 (P)</label><input id="setBaseMoveCost" type="number" min="1" value="${state.settings.baseMoveCost}"></div><div class="field"><label>보물상자 운반 추가비용 (P)</label><input id="setChestCarryExtra" type="number" min="0" value="${state.settings.chestCarryExtra}"></div><div class="field"><label>자판기 음료수 가격 (P)</label><input id="setDrinkCost" type="number" min="0" value="${ls.drinkCost}"></div><div class="field"><label>음료 거절 시 다음 이동 무효 확률 (%)</label><input id="setSlowChance" type="number" min="0" max="100" value="${ls.slowChance ?? 50}"></div></div><div class="settings-group-title">이동 후 이벤트 발생확률</div><div class="adventure-settings-grid"><div class="field"><label>선택의 길 (%)</label><input class="event-prob-input" id="setProbFork" type="number" min="0" max="100" step="1" value="${ep.fork}"></div><div class="field"><label>상인 예고 (%)</label><input class="event-prob-input" id="setProbMerchant" type="number" min="0" max="100" step="1" value="${ep.merchant}"></div><div class="field"><label>수상한 상인 (%)</label><input class="event-prob-input" id="setProbMysteryMerchant" type="number" min="0" max="100" step="1" value="${ep.mysteryMerchant ?? 8}"></div><div class="field"><label>보물상자 (%)</label><input class="event-prob-input" id="setProbChest" type="number" min="0" max="100" step="1" value="${ep.chest}"></div><div class="field"><label>길 위 돌발사건 (%)</label><input class="event-prob-input" id="setProbRoad" type="number" min="0" max="100" step="1" value="${ep.road}"></div><div class="field"><label>생활형 이벤트 (%)</label><input class="event-prob-input" id="setProbLife" type="number" min="0" max="100" step="1" value="${ep.life}"></div></div><div class="probability-summary" id="probabilitySummary">현재 이벤트 합계 <strong>${probTotal}%</strong> · 평범한 이동 <strong>${Math.max(0, 100 - probTotal)}%</strong><br>각 확률의 합이 100%를 넘을 수 없습니다.</div></div><div class="admin-card"><h3>선택의 길 설정</h3><p class="admin-sub">선택의 길의 이름·분위기는 코드의 <b>CHOICE_PATH_TYPES</b>에서 여러 종류를 편집할 수 있고, 아래 값은 모든 선택의 길의 좌·우 비용과 이동 범위에 공통 적용됩니다. 왼쪽은 '안전한 길'(최소=최대로 두면 늘 같은 칸), 오른쪽은 '모험 길'(범위가 넓을수록 운이 커져요)로 쓰는 걸 추천해요.</p><div class="adventure-settings-grid"><div class="field"><label>왼쪽 선택지 기본 비용 (P)</label><input id="setForkLeftCost" type="number" min="0" value="${fs.leftCost}"></div><div class="field"><label>왼쪽 선택지 기본 최소 이동</label><input id="setForkLeftMin" type="number" min="1" value="${fs.leftMin}"></div><div class="field"><label>왼쪽 선택지 기본 최대 이동</label><input id="setForkLeftMax" type="number" min="1" value="${fs.leftMax}"></div><div class="field"><label>오른쪽 선택지 기본 비용 (P)</label><input id="setForkRightCost" type="number" min="0" value="${fs.rightCost}"></div><div class="field"><label>오른쪽 선택지 기본 최소 이동</label><input id="setForkRightMin" type="number" min="1" value="${fs.rightMin}"></div><div class="field"><label>오른쪽 선택지 기본 최대 이동</label><input id="setForkRightMax" type="number" min="1" value="${fs.rightMax}"></div></div><div class="fork-balance" id="forkBalance">${forkBalanceHtml(fs)}</div></div><div class="admin-card"><h3>길거리 상인 설정</h3><div class="adventure-settings-grid"><div class="field"><label>상인이 보이는 최소 거리</label><input id="setMerchantMin" type="number" min="1" value="${md.min}"></div><div class="field"><label>상인이 보이는 최대 거리</label><input id="setMerchantMax" type="number" min="1" value="${md.max}"></div><div></div>${SHOP.map(it => `<div class="field"><label>${it.icon} ${it.name} 가격</label><input data-shop-price="${it.key}" type="number" min="0" value="${shopPrice(it.key, it.price)}"></div>`).join('')}</div></div><div class="admin-card"><h3>수상한 상인 설정</h3><p class="admin-sub">각 가격을 골랐을 때 좋은 결과가 나올 확률을 바꿀 수 있어요.</p><div class="adventure-settings-grid"><div class="field"><label>10P 좋은 결과 확률 (%)</label><input id="setMysteryGood10" type="number" min="0" max="100" value="${ms.goodChances[10]}"></div><div class="field"><label>20P 좋은 결과 확률 (%)</label><input id="setMysteryGood20" type="number" min="0" max="100" value="${ms.goodChances[20]}"></div><div class="field"><label>30P 좋은 결과 확률 (%)</label><input id="setMysteryGood30" type="number" min="0" max="100" value="${ms.goodChances[30]}"></div><div class="field"><label>40P 좋은 결과 확률 (%)</label><input id="setMysteryGood40" type="number" min="0" max="100" value="${ms.goodChances[40]}"></div></div></div><div class="admin-card"><h3>길 위 돌발사건 설정</h3><div class="adventure-settings-grid two"><div class="field"><label>통행료 청구서 손실 (P)</label><input id="setRoadLoss" type="number" min="0" value="${rs.loss}"></div><div class="field"><label>행운·감사 보상 (P)</label><input id="setRoadGain" type="number" min="0" value="${rs.gain}"></div></div></div><div class="admin-card"><h3>보물상자 보상 설정</h3><p class="admin-sub">열쇠로 연 보물상자에는 아래에서 선택한 좋은 보상만 등장합니다.</p><div class="bonus-options">${[['early', '수업 3분 일찍 마치기'], ['note', '보너스 포인트 +10P'], ['present', '숲길 안내지도 1개'], ['snack', '작은 간식'], ['free', '쾌속 주행권 1개']].map(([k, n]) => `<label class="bonus-option"><input type="checkbox" data-reward="${k}" ${rewards[k] ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div><div class="actions"><button class="primary" id="saveBonus">모험 설정 저장</button></div></div>`;
        $('teacherRecords').innerHTML = `<div class="admin-card"><h3>전체 실천 기록</h3><p class="admin-sub">클라우드 연결 없이 이 브라우저에 저장된 다른 날짜·학생의 기록을 볼 수 있어요.</p><div class="filter-row"><div class="field"><label>날짜 필터</label><input id="recordDateFilter" type="date"></div><div class="field"><label>참여자 필터</label><select id="recordStudentFilter"><option value="">전체 학생</option>${state.students.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div></div><div class="table-wrap"><table class="admin-table"><thead><tr><th>날짜</th><th>학생</th><th>나의 실천</th><th>공동 목표</th><th>좋은 행동 발견</th><th>칭찬 쪽지</th><th>이야기</th><th>포인트</th><th>관리</th></tr></thead><tbody id="recordRows"></tbody></table></div></div>`;
        $('teacherBadges').innerHTML = `<div class="admin-card"><h3>배지 지급</h3><p class="admin-sub">수업 중 확인한 활동 배지는 미리 예약해두고, 학생이 다음 기록을 제출할 때 처음 공개돼요.</p><div class="award-grid"><div class="field"><label>학생 선택</label><select id="awardStudent">${active.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div><div class="field"><label>배지 선택</label><select id="awardBadge">${Object.entries(BADGES).filter(([k]) => !['first', 'steady'].includes(k)).map(([k, b]) => `<option value="${k}">${b.icon} ${b.name}</option>`).join('')}</select></div></div><div class="actions"><button class="primary" id="awardBadgeBtn">배지 지급 예약</button></div><div class="badge-catalog">${Object.entries(BADGES).map(([k, b]) => `<div class="catalog-card"><b>${b.icon} ${b.name}</b><small>${b.desc}</small></div>`).join('')}</div></div>`;
        $('teacherBackup').innerHTML = `<div class="admin-card"><h3>☁ 클라우드 저장</h3><p class="admin-sub">기록과 모험 진행은 클라우드(Supabase)에 자동으로 저장되고, 같은 교사 계정으로 연결한 모든 기기에서 함께 보여요. 다른 기기의 변경은 ${Math.round(CLOUD_POLL_MS / 1000)}초마다 확인해요.</p><div class="cloud-info" id="cloudInfo"></div><div class="backup-row"><button class="secondary" id="cloudReloadBtn" type="button">클라우드에서 다시 불러오기</button><button class="danger" id="cloudDisconnectBtn" type="button">이 기기 연결 끊기</button></div></div><div class="admin-card"><h3>백업·복구</h3><p class="admin-sub">클라우드와 별개로, 중요한 시점마다 JSON 백업 파일을 받아 두면 더 안전해요.</p><div class="backup-row"><button class="primary" id="exportJson">전체 백업 JSON</button><button class="secondary" id="exportCsv">기록 CSV</button><label class="secondary" for="importJson" style="cursor:pointer">백업 파일 복구</label><input class="hidden" id="importJson" type="file" accept=".json,application/json"></div><div class="snapshot-note">백업 파일을 복구하면 그 내용이 클라우드에도 저장돼요.</div><div class="danger-zone"><h3>전체 초기화</h3><p class="admin-sub">모든 학생 설정·기록·포인트·모험 진행을 지웁니다.</p><button class="danger" id="resetAll">모든 데이터 초기화</button></div></div>`;
        const total = state.records.length, unique = new Set(state.records.map(r => r.studentId)).size;
        $('teacherReport').innerHTML = `<div class="report-box"><h2>${esc(UI_TEXT.className)} 활동 요약</h2><p><b>기간:</b> ${esc(state.settings.startDate)} ~ ${esc(state.settings.endDate)}</p><p><b>공동 목표:</b> ${esc(state.settings.goal)}</p><p><b>전체 기록:</b> ${total}회 · 참여 학생 ${unique}명</p><p><b>총 적립 포인트:</b> ${state.bank.earned}P · 임시 ${Number(state.bank.temp || 0)}P · 사용 ${state.bank.used}P · 잔액 ${available()}P</p><p><b>모험 진행:</b> ${state.adventure.step} / ${STAGES.at(-1).step}칸 (${STAGES[currentStageIndex()].name})</p><p><b>최종 공동 보상:</b> ${esc(state.settings.prizeName)}</p><p><b>칭찬 쪽지:</b> ${praiseRecords().length}장 · <b>전원 제출한 날:</b> ${Object.keys(state.bonusDays).length}일</p><h3 style="margin-top:16px">🤝 ${esc(UI_TEXT.promiseTitle)}</h3>${state.promises.length ? `<ol>${state.promises.map(p => `<li>${esc(p)}</li>`).join('')}</ol>` : '<p style="color:#8a96a7">아직 정하지 않았어요. (실천의 성에 도착하면 정해요)</p>'}<h3 style="margin-top:16px">💌 칭찬 쪽지 모음</h3>${praiseRecords().length ? `<ul class="report-praise">${praiseRecords().map(r => `<li><b>To. ${esc(r.praiseToName)}</b> ${esc(r.praiseText)} <small>(${esc(r.date)})</small></li>`).join('')}</ul>` : '<p style="color:#8a96a7">아직 쪽지가 없어요.</p>'}</div><div class="actions"><button class="primary" id="printReport">요약 인쇄</button></div>`;
        quizBonusDraft = null;
        quizDraft = JSON.parse(JSON.stringify(Object.fromEntries(STAGES.slice(1).map(st => [st.key, quizBank(st.key)]))));
        renderQuizEditor();
        bindTeacher();
        renderRecordRows();
    }
    // ============================================================
    // 13-1. 관문 퀴즈 편집 (교사 관리 > 관문 퀴즈)
    // ============================================================
    let quizDraft = {}, quizBonusDraft = null;
    // 화면에 입력된 내용을 quizDraft에 옮겨요 (추가·삭제할 때 입력하던 내용이 사라지지 않게)
    function readQuizDom() {
        if ($('setQuizBonus'))
            quizBonusDraft = $('setQuizBonus').value;
        STAGES.slice(1).forEach(st => {
            (quizDraft[st.key] || []).forEach((qz, i) => {
                const id = `${st.key}-${i}`;
                const qEl = document.querySelector(`[data-qz-q="${id}"]`);
                if (!qEl)
                    return;
                qz.q = qEl.value;
                qz.choices = [0, 1, 2, 3].map(c => document.querySelector(`[data-qz-c="${id}-${c}"]`)?.value ?? '');
                const ans = document.querySelector(`[name="qz-ans-${id}"]:checked`);
                qz.answer = ans ? Number(ans.value) : 0;
                qz.explain = document.querySelector(`[data-qz-e="${id}"]`)?.value ?? '';
            });
        });
    }
    function renderQuizEditor() {
        const box = $('teacherQuiz');
        if (!box)
            return;
        const stageCards = STAGES.slice(1).map(st => {
            const list = quizDraft[st.key] || [];
            const items = list.map((qz, i) => {
                const id = `${st.key}-${i}`, ch = [0, 1, 2, 3].map(c => qz.choices?.[c] ?? '');
                return `<div class="quiz-edit-item"><div class="quiz-edit-top"><b>문제 ${i + 1}</b><span><button class="secondary small-btn" type="button" data-qz-preview="${id}">미리보기</button> <button class="danger small-btn" type="button" data-qz-del="${id}">삭제</button></span></div><div class="field"><label>문제</label><textarea data-qz-q="${id}" rows="2">${esc(qz.q)}</textarea></div><div class="quiz-edit-choices">${ch.map((c, ci) => `<label class="quiz-edit-choice"><input type="radio" name="qz-ans-${id}" value="${ci}" ${Number(qz.answer) === ci ? 'checked' : ''} title="정답으로 표시"><span class="quiz-edit-no">${ci + 1}</span><input data-qz-c="${id}-${ci}" value="${esc(c)}" placeholder="${ci < 2 ? '보기 (필수)' : '보기 (비워 두면 안 나와요)'}"></label>`).join('')}</div><div class="field"><label>해설 (정답·오답 모두 보여줘요)</label><input data-qz-e="${id}" value="${esc(qz.explain)}"></div></div>`;
            }).join('');
            return `<div class="admin-card quiz-stage-card"><h3>${STAGE_ICONS[st.key] || '✨'} ${st.name} <small class="quiz-stage-count">${list.length}문제</small></h3>${list.length ? '' : `<p class="admin-sub">문제가 없으면 이 관문에서는 '${esc(STAGE_EVENTS[st.key]?.title || '관문 활동')}' 활동 문구가 나와요.</p>`}${items}<div class="actions"><button class="secondary" type="button" data-qz-add="${st.key}">+ 문제 추가</button></div></div>`;
        }).join('');
        box.innerHTML = `<div class="admin-card"><h3>관문 퀴즈</h3><p class="admin-sub">각 관문에 도착하면 그 관문의 문제 중 하나가 랜덤으로 나와요. 동그라미(●)를 누른 보기가 정답이에요. 보기 순서는 화면에서 섞여 나와요.</p><div class="form-grid" style="max-width:320px"><div class="field"><label>정답 보너스 (P)</label><input id="setQuizBonus" type="number" min="0" value="${esc(quizBonusDraft ?? quizBonus())}"></div></div></div>${stageCards}<div class="admin-card quiz-save-bar"><div class="actions" style="margin-top:0"><button class="primary" id="saveQuizzes" type="button">관문 퀴즈 저장</button><button class="danger" id="resetQuizzes" type="button">처음 기본 문제로 되돌리기</button></div><div class="snapshot-note">※ 저장하기 전에 다른 메뉴로 가면 고친 내용이 사라져요.</div></div>`;
        box.querySelectorAll('[data-qz-add]').forEach(b => b.onclick = () => { readQuizDom(); (quizDraft[b.dataset.qzAdd] ||= []).push({ q: '', choices: ['', '', '', ''], answer: 0, explain: '' }); renderQuizEditor(); });
        box.querySelectorAll('[data-qz-del]').forEach(b => b.onclick = () => { if (!confirm('이 문제를 지울까요? (저장해야 반영돼요)'))
            return; readQuizDom(); const [key, i] = b.dataset.qzDel.split('-'); quizDraft[key].splice(Number(i), 1); renderQuizEditor(); });
        box.querySelectorAll('[data-qz-preview]').forEach(b => b.onclick = () => { readQuizDom(); const [key, i] = b.dataset.qzPreview.split('-'); const qz = cleanQuiz(quizDraft[key][Number(i)]); if (typeof qz === 'string') {
            toast(qz);
            return;
        } showStageQuiz(STAGES.find(st => st.key === key), [qz], null, true); });
        $('saveQuizzes').onclick = saveQuizzes;
        $('resetQuizzes').onclick = () => { if (!confirm('관문 퀴즈를 처음 기본 문제로 되돌릴까요?\n직접 고치거나 추가한 문제는 사라져요.'))
            return; state.settings.quizzes = null; state.settings.quizBonus = QUIZ_BONUS; save(); renderTeacher(); toast('기본 문제로 되돌렸어요.'); };
    }
    // 문제 하나를 정리해요. 문제가 있으면 오류 문구(문자열)를 돌려줘요
    function cleanQuiz(qz) {
        const q = String(qz.q || '').trim();
        if (!q)
            return '문제 내용이 비어 있어요.';
        const raw = (qz.choices || []).map(c => String(c || '').trim());
        if (!raw[Number(qz.answer)])
            return `"${q.slice(0, 15)}…" 문제의 정답 보기가 비어 있어요.`;
        const kept = raw.map((c, i) => ({ c, i })).filter(x => x.c);
        if (kept.length < 2)
            return `"${q.slice(0, 15)}…" 문제는 보기가 2개 이상 필요해요.`;
        return { q, choices: kept.map(x => x.c), answer: kept.findIndex(x => x.i === Number(qz.answer)), explain: String(qz.explain || '').trim() };
    }
    function saveQuizzes() {
        readQuizDom();
        const out = {};
        for (const st of STAGES.slice(1)) {
            out[st.key] = [];
            for (const qz of quizDraft[st.key] || []) {
                const c = cleanQuiz(qz);
                if (typeof c === 'string') {
                    toast(`${st.name}: ${c}`);
                    return;
                }
                out[st.key].push(c);
            }
        }
        state.settings.quizzes = out;
        state.settings.quizBonus = Math.max(0, Math.floor(Number($('setQuizBonus').value) || 0));
        save();
        renderTeacher();
        toast('관문 퀴즈를 저장했어요.');
    }
    function bindTeacher() {
        document.querySelectorAll('[data-temp-point]').forEach(b => b.onclick = () => { const p = Math.max(0, Number(b.dataset.tempPoint) || 0); state.bank.temp = Number(state.bank.temp || 0) + p; save(); renderAll(); toast(`임시 포인트 ${p}P를 지급했어요.`); });
        const addTemp = $('addTempPoint');
        if (addTemp)
            addTemp.onclick = () => { const p = Math.floor(Number($('tempPointInput')?.value) || 0); if (p <= 0) {
                toast('지급할 포인트를 1P 이상 입력해 주세요.');
                return;
            } state.bank.temp = Number(state.bank.temp || 0) + p; save(); renderAll(); toast(`임시 포인트 ${p}P를 지급했어요.`); };
        const resetAdventureTest = $('resetAdventureTest');
        if (resetAdventureTest)
            resetAdventureTest.onclick = () => { if (!confirm('모험 테스트 데이터를 초기화할까요?\n학생 명단과 제출 기록은 유지됩니다.'))
                return; state.bank.temp = 0; state.bank.used = 0; state.bank.usage = []; state.adventure = initialState().adventure; state.promises = []; save(); renderAll(); toast('모험 테스트 데이터를 초기화했어요.'); };
        const clearTemp = $('clearTempPoint');
        if (clearTemp)
            clearTemp.onclick = () => { if (!confirm('임시 지급 포인트를 0P로 돌릴까요?\n이미 사용한 포인트와 모험 진행은 유지됩니다.'))
                return; state.bank.temp = 0; save(); renderAll(); toast('임시 포인트를 0P로 돌렸어요.'); };
        const saveParticipants = $('saveParticipants');
        if (saveParticipants)
            saveParticipants.onclick = () => { const draft = state.students.map(s => ({ s, name: document.querySelector(`[data-student-name="${s.id}"]`).value.trim() || s.name, color: document.querySelector(`[data-student-color="${s.id}"]`).value, pin: document.querySelector(`[data-student-pin="${s.id}"]`).value.trim() || s.pin, seat: Number(document.querySelector(`[data-student-seat="${s.id}"]`).value), active: document.querySelector(`[data-student-active="${s.id}"]`).checked })); if (draft.some(x => !/^\d{4}$/.test(x.pin))) {
                toast('학생 비밀번호는 숫자 4자리로 입력해 주세요.');
                return;
            } const seats = draft.filter(x => x.active).map(x => x.seat); if (new Set(seats).size !== seats.length) {
                toast('사용 중인 학생의 좌석 번호가 겹쳐요.');
                return;
            } draft.forEach(x => Object.assign(x.s, { name: x.name, color: x.color, pin: x.pin, seat: x.seat, active: x.active })); save(); renderAll(); toast('참여자 설정을 저장했어요.'); };
        const saveSettings = $('saveSettings');
        if (saveSettings)
            saveSettings.onclick = () => { const ids = ['Goal', 'ActiveDate', 'StartDate', 'EndDate', 'PrizeName']; const map = { Goal: 'goal', ActiveDate: 'activeDate', StartDate: 'startDate', EndDate: 'endDate', PrizeName: 'prizeName' }; ids.forEach(k => { const el = $('set' + k); if (el && el.value.trim())
                state.settings[map[k]] = el.value.trim(); }); state.settings.recordPoints = Math.max(0, Number($('setRecordPoints').value) || 0); state.settings.targetPoints = Math.max(1, Number($('setTargetPoints').value) || 1); state.settings.allSubmitBonus = Math.max(0, Math.floor(Number($('setAllSubmitBonus').value) || 0)); save(); renderAll(); toast('목표·상품 설정을 저장했어요.'); };
        const saveTeacherPin = $('saveTeacherPin');
        if (saveTeacherPin)
            saveTeacherPin.onclick = () => { const a = $('setTeacherPin')?.value || '', b = $('setTeacherPinConfirm')?.value || ''; if (a.length < 4) {
                toast('교사 비밀번호는 4자 이상 입력해 주세요.');
                return;
            } if (a !== b) {
                toast('새 비밀번호 확인이 일치하지 않아요.');
                return;
            } state.settings.teacherPin = a; save(); $('setTeacherPin').value = ''; $('setTeacherPinConfirm').value = ''; toast('교사 비밀번호를 변경했어요.'); };
        document.querySelectorAll('.event-prob-input').forEach(el => el.addEventListener('input', () => { const vals = ['setProbFork', 'setProbMerchant', 'setProbMysteryMerchant', 'setProbChest', 'setProbRoad', 'setProbLife'].map(id => Math.max(0, Number($(id)?.value) || 0)); const total = vals.reduce((a, b) => a + b, 0), box = $('probabilitySummary'); if (box)
            box.innerHTML = `현재 이벤트 합계 <strong>${total}%</strong> · 평범한 이동 <strong>${Math.max(0, 100 - total)}%</strong><br>${total > 100 ? '⚠️ 합계를 100% 이하로 낮춰 주세요.' : '각 확률의 합이 100%를 넘을 수 없습니다.'}`; }));
        const forkIds = ['setForkLeftCost', 'setForkLeftMin', 'setForkLeftMax', 'setForkRightCost', 'setForkRightMin', 'setForkRightMax', 'setBaseMoveCost'];
        const updateForkBalance = () => { const v = id => Math.max(0, Number($(id)?.value) || 0); const box = $('forkBalance'); if (!box)
            return; const saved = state.settings.baseMoveCost; state.settings.baseMoveCost = Math.max(1, v('setBaseMoveCost') || 1); box.innerHTML = forkBalanceHtml({ leftCost: v('setForkLeftCost'), leftMin: Math.max(1, v('setForkLeftMin')), leftMax: Math.max(v('setForkLeftMin'), v('setForkLeftMax'), 1), rightCost: v('setForkRightCost'), rightMin: Math.max(1, v('setForkRightMin')), rightMax: Math.max(v('setForkRightMin'), v('setForkRightMax'), 1) }); state.settings.baseMoveCost = saved; };
        forkIds.forEach(id => $(id)?.addEventListener('input', updateForkBalance));
        const saveBonus = $('saveBonus');
        if (saveBonus)
            saveBonus.onclick = () => {
                const probs = { fork: Math.max(0, Number($('setProbFork').value) || 0), merchant: Math.max(0, Number($('setProbMerchant').value) || 0), mysteryMerchant: Math.max(0, Number($('setProbMysteryMerchant').value) || 0), chest: Math.max(0, Number($('setProbChest').value) || 0), road: Math.max(0, Number($('setProbRoad').value) || 0), life: Math.max(0, Number($('setProbLife').value) || 0) };
                const total = Object.values(probs).reduce((a, b) => a + b, 0);
                if (total > 100) {
                    toast(`이벤트 확률 합계가 ${total}%예요. 100% 이하로 맞춰 주세요.`);
                    return;
                }
                state.settings.baseMoveCost = Math.max(1, Math.floor(Number($('setBaseMoveCost').value) || 10));
                state.settings.chestCarryExtra = Math.max(0, Math.floor(Number($('setChestCarryExtra').value) || 0));
                state.settings.eventProbabilities = probs;
                const minD = Math.max(1, Math.floor(Number($('setMerchantMin').value) || 1)), maxD = Math.max(minD, Math.floor(Number($('setMerchantMax').value) || minD));
                state.settings.merchantDistance = { min: minD, max: maxD };
                const lmin = Math.max(1, Math.floor(Number($('setForkLeftMin').value) || 1)), lmax = Math.max(lmin, Math.floor(Number($('setForkLeftMax').value) || lmin)), rmin = Math.max(1, Math.floor(Number($('setForkRightMin').value) || 1)), rmax = Math.max(rmin, Math.floor(Number($('setForkRightMax').value) || rmin));
                state.settings.forkSettings = { leftCost: Math.max(0, Math.floor(Number($('setForkLeftCost').value) || 0)), leftMin: lmin, leftMax: lmax, rightCost: Math.max(0, Math.floor(Number($('setForkRightCost').value) || 0)), rightMin: rmin, rightMax: rmax };
                const nextShopPrices = { ...state.settings.shopPrices };
                document.querySelectorAll('[data-shop-price]').forEach(el => nextShopPrices[el.dataset.shopPrice] = Math.max(0, Math.floor(Number(el.value) || 0)));
                delete nextShopPrices.luck;
                state.settings.shopPrices = nextShopPrices;
                state.settings.mysteryMerchantSettings = { goodChances: { 10: Math.max(0, Math.min(100, Math.floor(Number($('setMysteryGood10').value) || 0))), 20: Math.max(0, Math.min(100, Math.floor(Number($('setMysteryGood20').value) || 0))), 30: Math.max(0, Math.min(100, Math.floor(Number($('setMysteryGood30').value) || 0))), 40: Math.max(0, Math.min(100, Math.floor(Number($('setMysteryGood40').value) || 0))) } };
                state.settings.roadSettings = { loss: Math.max(0, Math.floor(Number($('setRoadLoss').value) || 0)), gain: Math.max(0, Math.floor(Number($('setRoadGain').value) || 0)) };
                state.settings.lifeSettings = { drinkCost: Math.max(0, Math.floor(Number($('setDrinkCost').value) || 0)), slowChance: Math.max(0, Math.min(100, Math.floor(Number($('setSlowChance').value) || 0))) };
                document.querySelectorAll('[data-reward]').forEach(el => state.settings.chestRewards[el.dataset.reward] = el.checked);
                state.settings.chestRewards.empty = false;
                save();
                renderAll();
                toast('모험 설정을 저장했어요.');
            };
        const award = $('awardBadgeBtn');
        if (award)
            award.onclick = () => { const s = state.students.find(x => x.id === $('awardStudent').value), k = $('awardBadge').value; if (!s)
                return; if (s.badges.includes(k) || s.pendingBadges.includes(k)) {
                toast('이미 받은 배지이거나 지급 대기 중이에요.');
                return;
            } s.pendingBadges.push(k); save(); renderAll(); toast(`${s.name}에게 ${BADGES[k].name} 배지를 예약했어요.`); };
        const df = $('recordDateFilter'), sf = $('recordStudentFilter');
        if (df)
            df.oninput = renderRecordRows;
        if (sf)
            sf.onchange = renderRecordRows;
        renderCloudInfo();
        const crb = $('cloudReloadBtn');
        if (crb)
            crb.onclick = cloudReloadFromServer;
        const cdb = $('cloudDisconnectBtn');
        if (cdb)
            cdb.onclick = cloudDisconnect;
        const ej = $('exportJson');
        if (ej)
            ej.onclick = exportJson;
        const ec = $('exportCsv');
        if (ec)
            ec.onclick = exportCsv;
        const ij = $('importJson');
        if (ij)
            ij.onchange = importJson;
        const ra = $('resetAll');
        if (ra)
            ra.onclick = () => { if (confirm('모든 데이터와 기록을 정말 초기화할까요?\n클라우드에 저장된 내용도 함께 지워져서, 연결된 모든 기기에서 사라져요.')) {
                state = initialState();
                save();
                showAppView('home');
                renderAll();
                toast('전체 데이터를 초기화했어요.');
            } };
        const pr = $('printReport');
        if (pr)
            pr.onclick = () => window.print();
    }
    function renderRecordRows() { const body = $('recordRows'); if (!body)
        return; const d = $('recordDateFilter')?.value || '', sid = $('recordStudentFilter')?.value || ''; const rows = [...state.records].filter(r => (!d || r.date === d) && (!sid || r.studentId === sid)).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))); body.innerHTML = rows.length ? rows.map(r => `<tr><td>${esc(r.date)}</td><td>${esc(r.studentName || state.students.find(s => s.id === r.studentId)?.name || '')}</td><td>${esc(r.practice)}</td><td>${esc(r.goal)}</td><td>${esc(r.notice)}</td><td style="min-width:160px;white-space:normal">${r.praiseText ? `<b>To. ${esc(r.praiseToName)}</b><br>${esc(r.praiseText)}` : '-'}</td><td style="min-width:180px;white-space:normal">${esc(r.story)}</td><td>${Number(r.points) || 0}P</td><td><button class="danger" data-delete-record="${esc(r.id)}" style="padding:6px 9px">삭제</button></td></tr>`).join('') : '<tr><td colspan="9" style="text-align:center;color:#8a96a7">조건에 맞는 기록이 없어요.</td></tr>'; body.querySelectorAll('[data-delete-record]').forEach(b => b.onclick = () => deleteRecord(b.dataset.deleteRecord)); }
    function deleteRecord(id) { const r = state.records.find(x => x.id === id); if (!r || !confirm('이 기록을 삭제할까요?'))
        return; state.records = state.records.filter(x => x.id !== id); state.bank.earned = Math.max(0, state.bank.earned - (Number(r.points) || 0)); const s = state.students.find(x => x.id === r.studentId); if (s) {
        s.records = state.records.filter(x => x.studentId === s.id).length;
        if (r.date === today() && !state.records.some(x => x.date === today() && x.studentId === s.id))
            s.submittedToday = false;
    } const got = Number(state.bonusDays[r.date]) || 0; let revoked = false; if (got && !state.students.filter(x => x.active !== false).every(x => state.records.some(y => y.date === r.date && y.studentId === x.id))) {
        state.bank.earned = Math.max(0, state.bank.earned - got);
        delete state.bonusDays[r.date];
        revoked = true;
    } save(); renderAll(); toast(revoked ? `기록을 삭제했어요. 그날 전원 제출 보너스(${got}P)도 취소됐어요.` : '기록을 삭제했어요.'); }
    // ============================================================
    // 14. 백업·내보내기·불러오기
    // ============================================================
    function download(name, text, type) { const blob = new Blob([text], { type }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 100); }
    function exportJson() { download(`quest_backup_${today()}.json`, JSON.stringify(state, null, 2), 'application/json'); }
    function csvCell(v) { const s = String(v ?? '').replaceAll('"', '""'); return `"${s}"`; }
    function exportCsv() { const head = ['날짜', '학생', '나의 실천', '공동 목표', '좋은 행동 발견', '칭찬 받은 사람', '칭찬 쪽지', '이야기', '포인트']; const lines = [head, ...state.records.map(r => [r.date, r.studentName, r.practice, r.goal, r.notice, r.praiseToName || '', r.praiseText || '', r.story, r.points])].map(row => row.map(csvCell).join(',')); download(`quest_records_${today()}.csv`, '\ufeff' + lines.join('\n'), 'text/csv;charset=utf-8'); }
    function importJson(e) { const f = e.target.files?.[0]; if (!f)
        return; const reader = new FileReader(); reader.onload = () => { try {
        const x = normalize(JSON.parse(reader.result));
        if (!confirm('현재 데이터를 백업 파일 내용으로 바꿀까요?'))
            return;
        state = x;
        save();
        renderAll();
        toast('백업 파일을 복구했어요.');
    }
    catch (err) {
        toast('백업 파일을 읽지 못했어요.');
    } }; reader.readAsText(f); e.target.value = ''; }
    // ============================================================
    // 15. 화면 전환·시작
    // ============================================================
    function showAppView(view) {
        $('homeView').classList.toggle('hidden', view !== 'home');
        $('adventureView').classList.toggle('hidden', view !== 'adventure');
        $('teacherView').classList.toggle('hidden', view !== 'teacher');
        document.querySelector('.main-tabs').classList.toggle('hidden', view === 'teacher');
        $('teacherEntry').classList.toggle('hidden', view === 'teacher');
        if (view !== 'teacher')
            document.querySelectorAll('.main-tab').forEach(x => x.classList.toggle('active', x.dataset.view === view));
        if (view === 'teacher')
            renderTeacher();
        else
            renderAll();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    document.querySelectorAll('.main-tab').forEach(b => b.onclick = () => showAppView(b.dataset.view));
    $('teacherEntry').onclick = () => { pinMode = 'teacher'; $('teacherPinInput').value = ''; modal('teacherLockModal', true); setTimeout(() => $('teacherPinInput').focus(), 80); };
    $('teacherPinConfirm').onclick = () => { if ($('teacherPinInput').value !== state.settings.teacherPin) {
        toast('관리자 비밀번호가 맞지 않아요.');
        return;
    } modal('teacherLockModal', false); if (pinMode === 'teacherKey') {
        state.adventure.inventory.key = keyCount() + 1;
        save();
        renderAll();
        if (state.adventure.carryingChest) {
            showEventPopup(iconHTML('key', 'lg'), '탐험 열쇠를 얻었다!', `수업 약속을 잘 지켜 탐험 열쇠를 받았어요. (지금 ${keyCount()}개)<br>지금 버스에 실어 둔 <b>보물상자를 열 수 있습니다.</b>`, `<button class="primary" id="openCarriedChestBtn">${iconHTML('chest', 'xs')} 지금 상자 열기</button><button class="secondary" id="laterChestBtn">조금 있다 열기</button>`);
            setTimeout(() => { $('openCarriedChestBtn').onclick = openChest; $('laterChestBtn').onclick = closeEventPopup; }, 0);
        }
        else
            toast(`탐험 열쇠를 1개 얻었어요. (지금 ${keyCount()}개)`);
        return;
    } showAppView('teacher'); };
    $('teacherPinInput').addEventListener('keydown', e => { if (e.key === 'Enter')
        $('teacherPinConfirm').click(); });
    $('teacherBack').onclick = () => showAppView('home');
    $('promiseEdit').onclick = () => showPromiseMaker();
    // 페이지를 켜 둔 채로 날짜가 바뀌어도 자동으로 새 날짜에 맞춰요 (1분마다·화면으로 돌아올 때 확인)
    setInterval(() => { if (checkNewDay())
        renderAll(); }, 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && checkNewDay())
        renderAll(); });
    document.querySelectorAll('.teacher-tab').forEach(b => b.onclick = () => { document.querySelectorAll('.teacher-tab').forEach(x => x.classList.toggle('active', x === b)); document.querySelectorAll('.teacher-section').forEach(x => x.classList.remove('active')); const id = 'teacher' + b.dataset.teacherTab[0].toUpperCase() + b.dataset.teacherTab.slice(1); $(id)?.classList.add('active'); renderTeacher(); });
    renderAll();
    initCloud();
})();
