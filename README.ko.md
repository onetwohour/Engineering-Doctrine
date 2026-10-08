# Engineering Doctrine

[English](README.md) · [简体中文](README.zh-CN.md) · **한국어**

**Engineering Doctrine**은 Claude Code가 수정 전에 실제 원인과 ownership, invariant, lifecycle, boundary를 확인하고, 필요한 범위만 변경한 뒤, 행동을 증거로 검증하고 완료 전에 변경 전체를 다시 검토하도록 하는 작업 규범 플러그인입니다.

## 설치

```bash
claude plugin marketplace add onetwohour/claude-plugins
claude plugin install engineering-doctrine@onetwohour
```

설치한 뒤에는 새 Claude Code 세션을 시작하면 됩니다.

## 사용

별도 명령은 필요하지 않습니다. 평소처럼 작업을 요청하면 됩니다.

```text
로그인 후 간헐적으로 세션이 풀리는 원인을 찾아서 고쳐줘.
```

```text
이 모듈의 ownership 구조를 분석하고 필요한 경우 리팩터링해줘.
```

```text
이 버그를 재현하고 수정한 뒤 회귀 테스트까지 추가해줘.
```

작업의 종류와 위험도에 따라 필요한 규칙만 적용됩니다. 작은 수정은 가볍게 처리하고, 구조·상태·보안·데이터·동시성·migration처럼 복잡한 작업은 더 깊게 검토합니다.

## 사용하면 어떻게 달라지나요?

Claude Code가 다음을 더 일관되게 지향합니다.

- 증상보다 실제 원인 수정
- 구현 전 ownership·state·invariant 확인
- 불필요한 abstraction과 architecture ceremony 억제
- 안전하고 정밀한 파일 변경
- 모델과 failure space에서 테스트 도출
- 실행하지 않은 것을 검증했다고 주장하지 않기
- 사용자 데이터와 기존 작업 보존
- 완료 전 diff와 evidence 재검토

## 규칙 지연 로딩과 검증 증거

원본 정본은 여전히 `doctrine/ENGINEERING_DOCTRINE.md` 하나입니다. 컴파일러는
각 Skill을 작은 **적용 조건·규칙 목록**으로 생성하고, 규칙의 전문은 개별 파일로
분리합니다. Claude가 관련 규칙을 적용하려면 해당 원문 파일을 읽어야 하며,
목록의 제목만으로 규칙을 준수했다고 주장해서는 안 됩니다.

독립 Reviewer는 이전처럼 14개 Skill 전체를 사전 로드하지 않고
`completion-and-review`의 목록 하나만 읽은 뒤, 실제 변경에 필요한 규칙을
선택해서 읽도록 변경했습니다. 세션 시작에 주입되는 최상위 불변식은 유지됩니다.

검증 결과도 구분합니다. `echo cargo test`처럼 문자열만 포함한 명령은 테스트
실행 증거가 아니며, 종료 코드를 확인하지 못한 명령 역시 테스트 성공으로 기록하지
않습니다. 변경 여부를 판별하지 못한 셸 명령은 기존 검증 기록을 유효한 것으로
무조건 유지하지 않습니다. 따라서 검사 결과가 보수적으로 무효화되는 경우는 있을 수
있지만, 불확실한 상태를 임의로 PASS로 만들지 않습니다.

```bash
node scripts/report-delivery-size.mjs
node scripts/build-doctrine.mjs --check
node --test tests/*.test.mjs
```

여기서 계산하는 것은 **정적 파일 크기와 예상 사전 로딩 범위**입니다.
실제 모델의 입력 토큰 절감률이나 규칙 준수율을 측정한 것은 아닙니다.
[행동 평가 시나리오](evaluations/behavior-cases.md)를 이용한 비교 검증이 필요합니다.

## 전체 규범

전체 Engineering Doctrine은 [doctrine/ENGINEERING_DOCTRINE.md](doctrine/ENGINEERING_DOCTRINE.md)에 있습니다.

## 로컬 사용

설치하지 않고 clone한 저장소에서 바로 실행하려면:

```bash
git clone https://github.com/onetwohour/Engineering-Doctrine.git
claude --plugin-dir ./Engineering-Doctrine/plugin
```

`--plugin-dir`은 해당 세션에만 적용되므로 Claude Code를 실행할 때마다 붙여야 합니다.

## 라이선스

[Apache-2.0](LICENSE)
