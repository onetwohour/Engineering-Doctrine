# Engineering Doctrine

[English](README.md) · [简体中文](README.zh-CN.md) · **한국어**

**Engineering Doctrine**은 Claude Code가 수정 전에 실제 원인과 ownership, invariant, lifecycle, boundary를 확인하고, 필요한 범위만 변경한 뒤, 행동을 증거로 검증하고 완료 전에 변경 전체를 다시 검토하도록 하는 작업 규범 플러그인입니다.

## 설치

```bash
claude plugin marketplace add onetwohour/Engineering-Doctrine
claude plugin install engineering-doctrine@onetwohour
```

설치 후 새 Claude Code 세션을 시작하면 됩니다.

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

저장소를 직접 checkout한 경우:

```bash
claude --plugin-dir ./plugin
```

## 라이선스

[Apache-2.0](LICENSE)
