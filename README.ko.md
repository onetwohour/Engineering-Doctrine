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

## 전체 규범

전체 Engineering Doctrine은 [doctrine/ENGINEERING_DOCTRINE.md](doctrine/ENGINEERING_DOCTRINE.md)에 있습니다.

## 로컬 사용

설치하지 않고 clone한 저장소에서 바로 실행하려면:

```bash
git clone https://github.com/onetwohour/Engineering-Doctrine.git
claude --plugin-dir ./Engineering-Doctrine/plugin
```

`--plugin-dir`은 해당 세션에만 적용되므로 Claude Code를 실행할 때마다 붙여야 합니다.

## doctrine 스킬이 쓰이지 않을 때

Claude Code는 모든 스킬의 이름과 설명을 모델 컨텍스트에 싣지만, 그 목록에는 모델 컨텍스트 창의 약 1%라는 예산이 있습니다. 설치된 스킬이 많으면 Claude Code는 호출 횟수가 적은 스킬부터 설명을 줄이거나 떨어뜨립니다. doctrine 스킬은 Claude만 호출하므로 설명을 가장 먼저 잃고, 설명이 없으면 Claude는 언제 로드해야 하는지 알 수 없습니다.

`/context`의 Skills 행에서 모델이 실제로 받는 목록 크기를, `/doctor`에서 목록 비용과 큰 항목을 확인할 수 있습니다. 예산을 넘겼다면 `settings.json`에 `"skillListingBudgetFraction": 0.02`를 넣어 예산을 올리거나, 필요 없는 스킬을 `skillOverrides`에서 `"name-only"`로 내립니다.

컨텍스트 압축 뒤에는 Claude Code가 이미 호출된 스킬의 본문을 예산 안에서 다시 붙이므로, 세션 초반에 로드한 doctrine 스킬은 유지됩니다. 한 번도 로드하지 않은 스킬은 해당 순간이 왔을 때 로드해야 합니다.

## 라이선스

[Apache-2.0](LICENSE)
