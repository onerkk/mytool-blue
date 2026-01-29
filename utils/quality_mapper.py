# -*- coding: utf-8 -*-
"""
將大運流年分析結果映射到 UI 顯示類別。
QualityMapper 通用版（Cycle / YunShiAnalysis / Dict）；AdvancedQualityMapper 依喜用神。
"""

from typing import Dict, List, Union, Any
import sys
from pathlib import Path

_root = Path(__file__).resolve().parents[1]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from data_structures import BaZi, DaYun, YunShiAnalysis, Cycle


# ---------------------------------------------------------------------------
# QualityMapper：通用版（level / score 映射，支援 Cycle / YunShiAnalysis / Dict）
# ---------------------------------------------------------------------------


class QualityMapper:
    """質量映射器 - 通用版本"""

    DEFAULT_MAPPING = {
        "level_mapping": {
            "大吉": {"label": "優", "class": "excellent", "score_threshold": 3.0},
            "中吉": {"label": "優", "class": "good", "score_threshold": 1.5},
            "小吉": {"label": "平", "class": "neutral-good", "score_threshold": 0.5},
            "平": {"label": "平", "class": "neutral", "score_threshold": 0.0},
            "小凶": {"label": "劣", "class": "warning", "score_threshold": -0.5},
            "中凶": {"label": "劣", "class": "bad", "score_threshold": -1.5},
            "大凶": {"label": "劣", "class": "danger", "score_threshold": -3.0},
        },
        "score_mapping": [
            {"min": 3.0, "max": 5.0, "label": "大優", "class": "excellent-bright"},
            {"min": 1.5, "max": 3.0, "label": "優", "class": "excellent"},
            {"min": 0.5, "max": 1.5, "label": "小優", "class": "good"},
            {"min": -0.5, "max": 0.5, "label": "平", "class": "neutral"},
            {"min": -1.5, "max": -0.5, "label": "小劣", "class": "warning"},
            {"min": -3.0, "max": -1.5, "label": "劣", "class": "bad"},
            {"min": -5.0, "max": -3.0, "label": "大劣", "class": "danger"},
        ],
    }

    @classmethod
    def getCycleQuality(
        cls, cycle: Union[Cycle, YunShiAnalysis, Dict[str, Any]]
    ) -> Dict[str, str]:
        """
        獲取周期質量評估。

        Args:
            cycle: Cycle 對象、YunShiAnalysis 對象或字典。

        Returns:
            {"label": str, "class": str}
        """
        if isinstance(cycle, YunShiAnalysis):
            data = {
                "level": cycle.level,
                "score": cycle.score,
                "dayun": cycle.dayun,
            }
        elif isinstance(cycle, Cycle):
            data = {
                "level": cycle.level or "",
                "score": cycle.score,
                "metadata": cycle.metadata,
            }
        elif isinstance(cycle, dict):
            data = cycle
        else:
            data = {}

        if data.get("level"):
            return cls._map_by_level(data["level"])
        if "score" in data and data["score"] is not None:
            return cls._map_by_score(float(data["score"]))
        return {"label": "平", "class": "neutral"}

    @classmethod
    def _map_by_level(cls, level: str) -> Dict[str, str]:
        mapping = cls.DEFAULT_MAPPING["level_mapping"]
        if level in mapping:
            return {
                "label": mapping[level]["label"],
                "class": mapping[level]["class"],
            }
        return {"label": "平", "class": "neutral"}

    @classmethod
    def _map_by_score(cls, score: float) -> Dict[str, str]:
        for rule in cls.DEFAULT_MAPPING["score_mapping"]:
            if rule["min"] <= score < rule["max"]:
                return {"label": rule["label"], "class": rule["class"]}
        return {"label": "平", "class": "neutral"}

    @classmethod
    def update_mapping(cls, config: Dict[str, Any]) -> None:
        """更新映射配置。"""
        cls.DEFAULT_MAPPING.update(config)

    get_cycle_quality = getCycleQuality  # 別名


# ---------------------------------------------------------------------------
# AdvancedQualityMapper：依喜用神、五行關係（沿用既有邏輯）
# ---------------------------------------------------------------------------

WUXING = {
    "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土",
    "庚": "金", "辛": "金", "壬": "水", "癸": "水",
}
SHENGKE = {
    "金": {"生": "水", "克": "木", "被生": "土", "被克": "火"},
    "木": {"生": "火", "克": "土", "被生": "水", "被克": "金"},
    "水": {"生": "木", "克": "火", "被生": "金", "被克": "土"},
    "火": {"生": "土", "克": "金", "被生": "木", "被克": "水"},
    "土": {"生": "金", "克": "水", "被生": "火", "被克": "木"},
}


class AdvancedQualityMapper:
    """考慮八字喜用神的質量評估器"""

    def __init__(self, bazi: BaZi):
        self.bazi = bazi
        self.useful_gods: List[str] = self._calculate_useful_gods()

    def _calculate_useful_gods(self) -> List[str]:
        dm = self.bazi.day_master
        wx = WUXING.get(dm[0] if dm else "甲", "木")
        out: List[str] = []
        if wx in SHENGKE:
            out.append(SHENGKE[wx]["被生"])
            out.append(wx)
        return out

    def get_cycle_quality(self, cycle: YunShiAnalysis) -> Dict[str, str]:
        dayun_element = cycle.dayun.element
        dayun_ganzhi = cycle.dayun.ganzhi
        day_master = self.bazi.day_master
        relation = self._get_relation_to_master(day_master, dayun_element)
        is_useful = self._check_if_useful(dayun_ganzhi, dayun_element)
        score = cycle.score
        if is_useful:
            score += 1.0
        return self._map_score_to_quality(score, relation)

    def _get_relation_to_master(self, master: str, element: str) -> str:
        m = WUXING.get(master[0] if master else "甲", "木")
        if m == element:
            return "同我"
        if SHENGKE.get(m, {}).get("生") == element:
            return "我生"
        if SHENGKE.get(m, {}).get("克") == element:
            return "我克"
        if SHENGKE.get(m, {}).get("被生") == element:
            return "生我"
        return "克我"

    def _check_if_useful(self, ganzhi: str, element: str) -> bool:
        if element and element in self.useful_gods:
            return True
        gan = ganzhi[0] if ganzhi else ""
        return WUXING.get(gan, "") in self.useful_gods

    def _map_score_to_quality(self, score: float, relation: str) -> Dict[str, str]:
        return QualityMapper._map_by_score(score)
