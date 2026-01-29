# -*- coding: utf-8 -*-
"""八字與大運資料結構（供 yunshi_analyzer、quality_mapper 使用）"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime


@dataclass
class Cycle:
    """周期數據結構（大運/流年）"""

    index: int
    name: str
    ganzhi: str
    age_range: str
    year_range: str
    is_current: bool
    level: str = ""
    score: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """轉換為字典（用於 JSON 序列化）"""
        return {
            "index": self.index,
            "name": self.name,
            "ganzhi": self.ganzhi,
            "age_range": self.age_range,
            "year_range": self.year_range,
            "is_current": self.is_current,
            "level": self.level,
            "score": self.score,
            "metadata": self.metadata,
        }


@dataclass
class BaZi:
    """八字資料結構"""

    year_ganzhi: str  # 年柱
    month_ganzhi: str  # 月柱
    day_ganzhi: str  # 日柱
    hour_ganzhi: str  # 時柱
    day_master: str  # 日主天干
    sex: str  # 性別（'男'/'女'）
    birth_date: datetime  # 出生日期


@dataclass
class DaYun:
    """大運資料結構"""

    index: int  # 第幾大運（0–9）
    ganzhi: str  # 大運干支，如 "甲子"
    age_start: int  # 起始年齡
    age_end: int  # 結束年齡
    element: str  # 五行屬性（金木水火土）
    current: bool  # 是否當前大運


@dataclass
class YunShiAnalysis:
    """運勢分析結果"""

    dayun: "DaYun"
    score: float  # 運勢評分約 -5～5
    level: str  # 大吉/中吉/小吉/平/小凶/中凶/大凶
    summary: str  # 簡要總結
    details: List[str]  # 詳細分析點
    suggestions: List[str]  # 建議
